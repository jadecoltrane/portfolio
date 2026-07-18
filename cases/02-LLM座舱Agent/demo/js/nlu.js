// 理解层（规则引擎模式）
// Demo 默认用确定性的规则解析代替 LLM：便于零依赖运行与稳定复现。
// 生产形态应替换为 LLM API（见 llm-adapter.js）；本文件同时定义两种模式共用的
// 意图结构：{ tool, params, ambiguity: {missing:[], candidates:[]}, say, plan? }
// 意图歧义由可观察信号构成（缺参数 / 多候选 / 指代不明），不使用模型自报置信度。

export function understand(text, ctx = {}) {
  const t = text.trim();

  // 测试控制台注入：强制歧义，用于稳定复现澄清流程
  if (ctx.inject?.ambiguity === 'missing') {
    return {
      tool: ctx.inject.tool ?? 'find_poi',
      params: {},
      ambiguity: { missing: ['距离偏好（顺路 / 目的地附近）'], candidates: [] },
      say: '我需要先确认一个信息。',
    };
  }
  if (ctx.inject?.ambiguity === 'candidates') {
    return {
      tool: null,
      params: {},
      ambiguity: { missing: [], candidates: ['空调', '音乐', '车窗'] },
      say: '你想关掉哪一个？',
    };
  }

  // —— 场景 1：体感温度 ——
  if (/(有点|好|太)?冷/.test(t)) {
    const target = Math.min((ctx.temperature ?? 22) + 2, 30);
    return {
      tool: 'set_temperature',
      params: { target },
      ambiguity: {},
      say: `听到了，你觉得冷。我把空调从 ${ctx.temperature ?? 22}°C 调到 ${target}°C。`,
    };
  }
  if (/(有点|好|太)?热/.test(t)) {
    const target = Math.max((ctx.temperature ?? 22) - 2, 16);
    return { tool: 'set_temperature', params: { target }, ambiguity: {}, say: `听到了，你觉得热。我把空调调到 ${target}°C。` };
  }
  const tempMatch = t.match(/温度调?到\s*(\d{2})/);
  if (tempMatch) {
    const target = Number(tempMatch[1]);
    return { tool: 'set_temperature', params: { target }, ambiguity: {}, say: `好的，空调调到 ${target}°C。` };
  }

  // —— 音量 ——
  const volMatch = t.match(/音量调?到\s*(\d{1,3})/);
  if (volMatch) {
    return { tool: 'set_volume', params: { target: Number(volMatch[1]) }, ambiguity: {}, say: `音量调到 ${volMatch[1]}。` };
  }

  // —— 灯光：歧义指令 vs 明确指令（对应 2026-02 公开事故的证据场景）——
  if (/关闭?(所有|全部)(的)?灯光?/.test(t)) {
    // “所有灯光”明确包含车外灯 → 候选动作是高风险的关外灯，交给策略层拦截
    return {
      tool: 'close_exterior_lights',
      params: {},
      ambiguity: {},
      say: '“所有灯光”包含车外大灯。',
    };
  }
  if (/关闭?(的)?阅读灯/.test(t)) {
    return { tool: 'close_reading_light', params: {}, ambiguity: {}, say: '好的，关闭阅读灯。' };
  }
  if (/关闭?(车外|外部)?(大)?灯/.test(t)) {
    return { tool: 'close_exterior_lights', params: {}, ambiguity: {}, say: '你要关闭车外灯光。' };
  }

  // —— 场景 2：多条件地点检索 ——
  if (/充电.*(遛狗|狗)|遛狗.*充电/.test(t)) {
    return {
      tool: 'find_poi',
      params: { query: '充电+可遛狗', steps: ['正在查充电设施', '正在核对周边遛狗条件', '正在按顺路程度筛选'] },
      ambiguity: {},
      say: '我来查找同时满足充电和遛狗条件的地点。',
      plan: ['查附近充电站', '筛选带绿地/宠物友好条件', '按顺路程度排序，给出候选'],
    };
  }

  // —— 场景 3：导航 / 消息 / 支付 ——
  if (/导航去公司/.test(t)) {
    return {
      tool: 'navigate_route',
      params: {},
      ambiguity: { missing: [], candidates: ['常用地址：公司（总部）', '最近一次导航：公司（分部）'] },
      say: '导航去公司——你有两个相关地址。',
    };
  }
  const navMatch = t.match(/导航去(.+?)(?:。|$)/);
  if (navMatch) {
    return { tool: 'navigate_route', params: { destination: navMatch[1] }, ambiguity: {}, say: `导航切换到「${navMatch[1]}」。` };
  }
  const msgMatch = t.match(/(?:发消息|发信息)给(.+?)(?:说|：|:)(.+)/);
  if (msgMatch) {
    return {
      tool: 'send_message',
      params: { to: msgMatch[1].trim(), text: msgMatch[2].trim() },
      ambiguity: {},
      say: `发消息给${msgMatch[1].trim()}，内容是：“${msgMatch[2].trim()}”。`,
    };
  }
  if (/(预约|付款|支付|下单)/.test(t)) {
    return {
      tool: 'pay',
      params: { item: '充电桩预约（演示）' },
      ambiguity: {},
      say: '预约需要完成支付。',
    };
  }

  // —— 多候选歧义：“关掉它” ——
  if (/关(掉|闭)(它|这个)/.test(t)) {
    return { tool: null, params: {}, ambiguity: { missing: [], candidates: ['空调', '音乐', '车窗'] }, say: '你想关掉哪一个？' };
  }

  // —— 规则引擎的能力边界：如实说明，不装懂 ——
  return {
    tool: null,
    params: {},
    ambiguity: {},
    unknown: true,
    say: '这句超出了演示规则引擎的理解范围（生产形态由 LLM 承担开放理解）。你可以试试场景按钮，或换一种说法。',
  };
}
