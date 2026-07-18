// 座舱 Agent Demo — 应用层
// 把 理解(nlu) → 策略(policy) → 执行(tools) → 恢复 串成可交互闭环。
// UI 原则（与正文一致）：语音按句播报、屏显按块更新、执行必回显、可逆必可撤销、
// 等待可解释、失败有出口、状态只有一个真相之源（vehicleState）。

import { understand } from './nlu.js';
import { evaluate, OUTCOME_LABELS, categoryLabel } from './policy.js';
import { TOOLS, DEFAULT_PERMISSIONS, createVehicleState, executeTool } from './tools.js';

const state = {
  vehicle: createVehicleState(),
  permissions: { ...DEFAULT_PERMISSIONS },
  inject: { ambiguity: null, toolFailure: false },
  pendingConfirm: null,   // {intent} 等待用户确认的动作
  pendingClarify: null,   // {intent} 等待补充信息的动作
  lastUndo: null,         // {fn, label}
  log: [],                // 行为记录
  inputTimestamp: 0,      // 用于首个可理解反馈时间
};

const $ = (sel) => document.querySelector(sel);

// ---------- 对话渲染 ----------

function addBubble(role, html, cls = '') {
  const wrap = $('#chat');
  const div = document.createElement('div');
  div.className = `bubble ${role} ${cls}`;
  div.innerHTML = html;
  wrap.appendChild(div);
  wrap.scrollTop = wrap.scrollHeight;
  return div;
}

// 语音按句播报：一句一条，不逐字滚动
function agentSay(sentence, cls = '') {
  const el = addBubble('agent', `<span class="voice-tag">播报</span>${escapeHtml(sentence)}`, cls);
  if (state.inputTimestamp) {
    const ms = Date.now() - state.inputTimestamp;
    logMetric(`首个可理解反馈：${ms} ms`);
    state.inputTimestamp = 0;
  }
  return el;
}

function agentCard(html, cls = '') {
  return addBubble('agent', html, `card ${cls}`);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ---------- 行为记录 ----------

function logEntry(entry) {
  state.log.unshift({ time: new Date().toLocaleTimeString('zh-CN', { hour12: false }), ...entry });
  renderLog();
}
function logMetric(text) { logEntry({ kind: 'metric', text }); }

function renderLog() {
  const el = $('#action-log');
  el.innerHTML = state.log.slice(0, 30).map((e) => {
    if (e.kind === 'metric') return `<div class="log-row metric">⏱ ${escapeHtml(e.text)} <span class="t">${e.time}</span></div>`;
    return `<div class="log-row">
      <div><b>${escapeHtml(e.request)}</b> → <span class="outcome o-${e.outcome}">${OUTCOME_LABELS[e.outcome] ?? e.outcome}</span>${e.result ? ` · ${escapeHtml(e.result)}` : ''}${e.undoable ? ' · 可撤销' : ''}</div>
      <div class="why">${(e.reasons ?? []).map(escapeHtml).join('；')}</div>
      <span class="t">${e.time}</span>
    </div>`;
  }).join('');
}

// ---------- 车辆状态渲染（真相之源） ----------

function renderVehicle() {
  const v = state.vehicle;
  $('#st-gear').textContent = v.gear;
  $('#st-speed').textContent = v.gear === 'P' ? '0' : v.speedKmh;
  $('#st-network').textContent = v.network ? '在线' : '离线';
  $('#st-network').className = v.network ? 'ok' : 'bad';
  $('#st-temp').textContent = `${v.temperature}°C`;
  $('#st-volume').textContent = v.volume;
  $('#st-ext-lights').textContent = v.exteriorLights ? '开' : '关';
  $('#st-reading-light').textContent = v.readingLight ? '开' : '关';
  $('#st-route').textContent = v.route;
  $('#gear-toggle').textContent = v.gear === 'D' ? '切到 P 挡（停车）' : '切到 D 挡（行驶）';
  $('#pending-tasks').innerHTML = v.pendingTasks.length
    ? v.pendingTasks.map((t, i) => `<button class="chip resume" data-resume="${i}">▶ ${escapeHtml(t.label)}</button>`).join('')
    : '<span class="dim">无</span>';
}

// ---------- 主流程：一次用户输入的完整生命周期 ----------

async function handleUserInput(text) {
  if (!text.trim()) return;
  addBubble('user', escapeHtml(text));
  state.inputTimestamp = Date.now();

  // 撤销口令走快捷通道：纠错必须比“重新说一遍”快
  if (/^(撤销|取消刚才|恢复)/.test(text.trim())) { doUndo(); return; }

  // 待澄清状态下，本次输入视为补充信息
  if (state.pendingClarify) { resolveClarify(text); return; }

  const intent = understand(text, {
    temperature: state.vehicle.temperature,
    gear: state.vehicle.gear,
    network: state.vehicle.network,
    inject: state.inject.ambiguity ? { ambiguity: state.inject.ambiguity } : null,
  });
  state.inject.ambiguity = null; // 歧义注入一次性生效
  syncInjectUI();

  if (intent.unknown) { agentSay(intent.say, 'warn'); return; }

  await runIntent(text, intent);
}

async function runIntent(requestText, intent) {
  // 先给接受反馈：不让用户猜系统有没有听见
  if (intent.say) agentSay(intent.say);

  // 多步计划：屏显按块出现
  if (intent.plan) {
    agentCard(`<div class="card-title">执行计划</div><ol>${intent.plan.map((p) => `<li>${escapeHtml(p)}</li>`).join('')}</ol>`);
  }

  const verdict = evaluate(
    { tool: intent.tool, ambiguity: intent.ambiguity },
    { gear: state.vehicle.gear, network: state.vehicle.network, permissions: state.permissions },
  );

  logEntry({ request: requestText, outcome: verdict.outcome, reasons: verdict.reasons });

  switch (verdict.outcome) {
    case 'clarify': {
      state.pendingClarify = { intent, requestText };
      const cands = intent.ambiguity.candidates ?? [];
      agentCard(`<div class="card-title">需要补充信息</div>
        <div>${verdict.reasons.map(escapeHtml).join('；')}</div>
        ${cands.length ? `<div class="chips">${cands.slice(0, 3).map((c, i) => `<button class="chip" data-clarify="${i}">${i + 1}. ${escapeHtml(c)}</button>`).join('')}</div>` : ''}
        <div class="dim">直接说出选项，或换一种说法。歧义不是报错。</div>`, 'ask');
      agentSay(cands.length ? `请选择：${cands.slice(0, 3).map((c, i) => `${i + 1}，${c}`).join('；')}。` : '请补充一下信息。');
      break;
    }
    case 'offline': {
      agentCard(`<div class="card-title">当前离线</div><div>${verdict.reasons.map(escapeHtml).join('；')}</div>
        <div class="dim">可用：空调、音量、灯光等本地车控。云端检索、导航与支付恢复网络后可继续。</div>`, 'warn');
      agentSay('网络暂时不可用，我先记下这个任务，本地车控不受影响。');
      break;
    }
    case 'reject': {
      agentCard(`<div class="card-title">已拦截</div><div>${verdict.reasons.map(escapeHtml).join('；')}</div>
        ${verdict.alternative ? `<div class="alt">替代方案：${escapeHtml(verdict.alternative)}</div>` : ''}`, 'reject');
      agentSay(`这个操作我现在不能执行：${verdict.reasons[0]}。${verdict.alternative ? verdict.alternative : ''}`);
      break;
    }
    case 'defer': {
      state.vehicle.pendingTasks.push({ label: `${TOOLS[intent.tool].label}`, intent, requestText });
      renderVehicle();
      agentCard(`<div class="card-title">已保存，停车后继续</div><div>${verdict.reasons.map(escapeHtml).join('；')}</div>
        <div class="dim">挂 P 挡后，仪表区会出现恢复入口，任务不会丢。</div>`, 'defer');
      agentSay('这一步不适合在行驶中完成，我已保存任务，停车后提醒你继续。');
      break;
    }
    case 'confirm': {
      state.pendingConfirm = { intent, requestText };
      const meta = TOOLS[intent.tool];
      agentCard(`<div class="card-title">请确认</div>
        <div>动作：${escapeHtml(meta.label)}${intent.params?.destination ? ` → ${escapeHtml(intent.params.destination)}` : ''}${intent.params?.to ? `（发给 ${escapeHtml(intent.params.to)}）` : ''}</div>
        <div class="why">${verdict.reasons.map(escapeHtml).join('；')}</div>
        <div class="chips"><button class="chip yes" data-confirm="yes">确认执行</button><button class="chip no" data-confirm="no">算了</button></div>`, 'ask');
      agentSay('需要你确认一下，确认后我再执行。');
      break;
    }
    case 'execute': {
      await performExecution(intent, requestText);
      break;
    }
  }
}

async function performExecution(intent, requestText) {
  const meta = TOOLS[intent.tool];

  // 等待可解释：用行为说明替代抽象转圈
  if (intent.params?.steps) {
    for (const step of intent.params.steps) {
      const el = agentCard(`<div class="spinner"></div>${escapeHtml(step)}…`, 'waiting');
      await sleep(650);
      el.remove();
    }
  }

  const result = executeTool(intent.tool, intent.params, state.vehicle, { toolFailure: state.inject.toolFailure });
  renderVehicle();

  if (!result.ok) {
    // 失败有出口：保留意图上下文，给三选一，不让用户从头重说
    logEntry({ request: requestText, outcome: 'reject', reasons: ['工具执行失败'], result: result.echo });
    agentCard(`<div class="card-title">执行失败</div><div>${escapeHtml(result.echo)}</div>
      <div class="chips">
        <button class="chip" data-retry="1">重试</button>
        <button class="chip" data-retry="later">稍后再试</button>
        <button class="chip no" data-retry="drop">算了</button>
      </div>`, 'reject');
    agentSay('刚才的操作没有成功，你可以重试、稍后再试或放弃，我保留了你的目标。');
    state.pendingConfirm = { intent, requestText }; // 复用重试
    return;
  }

  // 特例：场景 2 的检索结果卡片（D 挡 2–3 个可瞥视候选；P 挡完整列表）
  if (intent.tool === 'find_poi') {
    renderPoiResults();
  }

  state.lastUndo = result.undo ? { fn: result.undo, label: meta.label } : null;
  logEntry({ request: requestText, outcome: 'execute', reasons: ['已执行'], result: result.echo, undoable: !!result.undo });
  agentCard(`<div class="card-title">已执行</div><div>${escapeHtml(result.echo)}</div>
    ${result.undo ? '<div class="chips"><button class="chip" data-undo="1">↩ 撤销</button></div>' : ''}`, 'done');
  agentSay(result.echo + (result.undo ? '，说“撤销”或点按钮可以恢复。' : ''));
}

function renderPoiResults() {
  const inDrive = state.vehicle.gear === 'D';
  const all = [
    { name: '绿岛充电公园', tags: '快充 8 桩 · 大草坪 · 顺路 +2min' },
    { name: '滨江充电站', tags: '快充 12 桩 · 江边步道 · 顺路 +6min' },
    { name: '万象城停车场', tags: '慢充 20 桩 · 宠物友好商场 · 偏离 12min' },
    { name: '城北服务区', tags: '快充 4 桩 · 小型宠物区 · 偏离 15min' },
    { name: '中央公园西门', tags: '慢充 6 桩 · 大型遛狗区 · 偏离 18min' },
  ];
  const list = inDrive ? all.slice(0, 3) : all;
  agentCard(`<div class="card-title">候选地点（演示数据）${inDrive ? ' · 行驶中只显示前 3 个' : ''}</div>
    <ol class="poi">${list.map((p) => `<li><b>${p.name}</b><span class="dim">${p.tags}</span></li>`).join('')}</ol>
    ${inDrive ? '<div class="dim">挂 P 挡可展开完整列表与比较。</div>' : ''}`);
  agentSay(inDrive ? `找到 ${all.length} 个地点，报给你最顺路的 3 个：${list.map((p, i) => `${i + 1}，${p.name}`).join('；')}。` : `找到 ${all.length} 个地点，已全部列出。`);
}

// ---------- 澄清 / 确认 / 撤销 / 恢复 ----------

function resolveClarify(text) {
  const { intent, requestText } = state.pendingClarify;
  state.pendingClarify = null;
  const cands = intent.ambiguity.candidates ?? [];
  const idxMatch = text.match(/[123１２３]/);
  let chosen = null;
  if (idxMatch) chosen = cands[Number(idxMatch[0]) - 1];
  if (!chosen) chosen = cands.find((c) => text.includes(c.slice(0, 2)));

  if (intent.tool === 'navigate_route' && chosen) {
    runIntent(requestText, { tool: 'navigate_route', params: { destination: chosen }, ambiguity: {}, say: `好的，${chosen}。` });
    return;
  }
  if (!intent.tool && chosen) {
    // “关掉它”类多候选：映射到对应工具
    const map = { 空调: { tool: 'set_temperature', params: { target: 26 }, say: '好的，空调恢复到 26°C 节能运行。' }, 音乐: { tool: 'set_volume', params: { target: 0 }, say: '好的，音乐已静音。' } };
    const m = map[chosen];
    if (m) { runIntent(requestText, { ...m, ambiguity: {} }); return; }
  }
  if (intent.tool === 'find_poi') {
    runIntent(requestText, { ...intent, ambiguity: {}, say: `明白，按「${escapeHtml(text)}」筛选。` });
    return;
  }
  agentSay('我还是没有对上，换一种说法试试？之前的目标我仍然记得。', 'warn');
  state.pendingClarify = { intent, requestText };
}

async function resolveConfirm(yes) {
  const pending = state.pendingConfirm;
  state.pendingConfirm = null;
  if (!pending) return;
  if (!yes) {
    logEntry({ request: pending.requestText, outcome: 'reject', reasons: ['用户取消'] });
    agentSay('好的，已取消，不会执行。');
    return;
  }
  await performExecution(pending.intent, pending.requestText);
}

function doUndo() {
  if (!state.lastUndo) { agentSay('当前没有可撤销的动作。', 'warn'); return; }
  const msg = state.lastUndo.fn();
  logEntry({ request: '撤销', outcome: 'execute', reasons: [`撤销「${state.lastUndo.label}」`], result: msg });
  state.lastUndo = null;
  renderVehicle();
  agentSay(msg);
}

function resumePending(i) {
  const task = state.vehicle.pendingTasks.splice(i, 1)[0];
  renderVehicle();
  if (task) {
    agentSay(`继续之前保存的任务：${task.label}。`);
    runIntent(task.requestText, task.intent);
  }
}

// ---------- 场景脚本 ----------

const SCENARIOS = {
  s1: { label: '场景 1｜“我有点冷”', lines: ['我有点冷'] },
  s2: { label: '场景 2｜“找个能充电还能遛狗的地方”', lines: ['找个能充电还能遛狗的地方'] },
  s3: { label: '场景 3｜改行程 → 付款拦截 → 断网', lines: ['导航去公司', '1', '帮我预约充电桩并付款'] },
  lights: { label: '证据场景｜“关闭所有灯光”（D 挡）', lines: ['关闭所有灯光'] },
};

async function playScenario(key) {
  const sc = SCENARIOS[key];
  addBubble('sys', `▶ ${sc.label}`);
  for (const line of sc.lines) {
    await handleUserInput(line);
    await sleep(900);
  }
  if (key === 's3') {
    await sleep(400);
    addBubble('sys', '▶（注入断网，再次尝试云端任务）');
    state.vehicle.network = false;
    renderVehicle(); syncInjectUI();
    await handleUserInput('找个能充电还能遛狗的地方');
  }
}

// ---------- 控制台 / 事件绑定 ----------

function syncInjectUI() {
  $('#inject-offline').checked = !state.vehicle.network;
  $('#inject-failure').checked = state.inject.toolFailure;
  document.querySelectorAll('[data-ambiguity]').forEach((b) => b.classList.toggle('active', state.inject.ambiguity === b.dataset.ambiguity));
}

function bind() {
  $('#send').addEventListener('click', () => { const i = $('#input'); handleUserInput(i.value); i.value = ''; });
  $('#input').addEventListener('keydown', (e) => { if (e.key === 'Enter') { handleUserInput(e.target.value); e.target.value = ''; } });

  $('#gear-toggle').addEventListener('click', () => {
    const v = state.vehicle;
    v.gear = v.gear === 'D' ? 'P' : 'D';
    renderVehicle();
    addBubble('sys', `▶ 已切换到 ${v.gear} 挡`);
    if (v.gear === 'P' && v.pendingTasks.length) {
      agentSay(`已停车。你有 ${v.pendingTasks.length} 个保存的任务，可以继续了。`);
    }
  });

  $('#inject-offline').addEventListener('change', (e) => { state.vehicle.network = !e.target.checked; renderVehicle(); addBubble('sys', `▶ 网络：${state.vehicle.network ? '恢复' : '断开'}（测试注入）`); });
  $('#inject-failure').addEventListener('change', (e) => { state.inject.toolFailure = e.target.checked; addBubble('sys', `▶ 工具故障注入：${e.target.checked ? '开' : '关'}`); });
  document.querySelectorAll('[data-ambiguity]').forEach((b) => b.addEventListener('click', () => {
    state.inject.ambiguity = state.inject.ambiguity === b.dataset.ambiguity ? null : b.dataset.ambiguity;
    syncInjectUI();
    addBubble('sys', `▶ 歧义注入：${state.inject.ambiguity ?? '关'}（对下一次输入生效）`);
  }));

  document.querySelectorAll('[data-scenario]').forEach((b) => b.addEventListener('click', () => playScenario(b.dataset.scenario)));

  $('#permissions').addEventListener('change', (e) => {
    if (e.target.matches('select')) {
      state.permissions[e.target.dataset.cat] = e.target.value;
      addBubble('sys', `▶ 授权调整：${categoryLabel(e.target.dataset.cat)} → ${{ auto: '自动执行', confirm: '每次确认', forbid: '禁止' }[e.target.value]}`);
    }
  });

  $('#chat').addEventListener('click', async (e) => {
    const t = e.target;
    if (t.dataset.undo) doUndo();
    if (t.dataset.confirm) resolveConfirm(t.dataset.confirm === 'yes');
    if (t.dataset.clarify !== undefined) resolveClarify(String(Number(t.dataset.clarify) + 1));
    if (t.dataset.retry) {
      if (t.dataset.retry === '1') { state.inject.toolFailure = false; syncInjectUI(); await resolveConfirm(true); }
      else if (t.dataset.retry === 'later') { agentSay('好的，我保留目标，稍后你可以直接说“重试”。'); }
      else { state.pendingConfirm = null; agentSay('好的，已放弃。'); }
    }
  });

  $('#status-panel').addEventListener('click', (e) => {
    if (e.target.dataset.resume !== undefined) resumePending(Number(e.target.dataset.resume));
  });
}

function renderPermissions() {
  $('#permissions').innerHTML = Object.entries(DEFAULT_PERMISSIONS).map(([cat]) => `
    <label class="perm-row">${categoryLabel(cat)}
      <select data-cat="${cat}">
        <option value="auto" ${state.permissions[cat] === 'auto' ? 'selected' : ''}>自动执行</option>
        <option value="confirm" ${state.permissions[cat] === 'confirm' ? 'selected' : ''}>每次确认</option>
        <option value="forbid" ${state.permissions[cat] === 'forbid' ? 'selected' : ''}>禁止</option>
      </select>
    </label>`).join('');
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- 启动 ----------

bind();
renderPermissions();
renderVehicle();
renderLog();
addBubble('sys', '座舱 Agent 安全委托闭环 · 机制演示。右侧控制台是<b>测试注入工具</b>，不代表量产系统能力；理解层当前为规则引擎模式（LLM 可插拔），授权决策全部由确定性策略层作出。');
agentSay('你好，我在。试试左边的场景按钮，或直接输入。');
