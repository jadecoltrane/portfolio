// 脚本化机制验证（对应 demo方案.md 第五节验证清单）
// 运行：node --test cases/02-LLM座舱Agent/demo/tests/
// 验证的是策略层与状态机制的确定性，不等同于真实道路分心测试或量产安全验证。

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluate } from '../js/policy.js';
import { understand } from '../js/nlu.js';
import { createVehicleState, executeTool, DEFAULT_PERMISSIONS } from '../js/tools.js';

const ctx = (over = {}) => ({
  gear: 'D',
  network: true,
  permissions: { ...DEFAULT_PERMISSIONS },
  ...over,
});

// ---------- 授权测试：同一请求在不同车辆状态和用户授权下，结果可预测 ----------

test('低风险可逆动作 + 授权自动 + D 挡 → 直接执行', () => {
  const v = evaluate({ tool: 'set_temperature', ambiguity: {} }, ctx());
  assert.equal(v.outcome, 'execute');
});

test('同一动作，用户把授权收紧为每次确认 → 请求确认', () => {
  const v = evaluate({ tool: 'set_temperature', ambiguity: {} }, ctx({ permissions: { ...DEFAULT_PERMISSIONS, climate: 'confirm' } }));
  assert.equal(v.outcome, 'confirm');
});

test('用户禁止某类操作 → 拒绝，且理由可解释', () => {
  const v = evaluate({ tool: 'set_volume', ambiguity: {} }, ctx({ permissions: { ...DEFAULT_PERMISSIONS, media: 'forbid' } }));
  assert.equal(v.outcome, 'reject');
  assert.ok(v.reasons.length > 0);
});

test('安全底线：行驶中关闭车外灯光 → 拒绝 + 给替代方案（2026-02 公开事故的对照）', () => {
  const v = evaluate({ tool: 'close_exterior_lights', ambiguity: {} }, ctx({ gear: 'D' }));
  assert.equal(v.outcome, 'reject');
  assert.ok(v.alternative);
});

test('安全底线不随用户授权放宽：授权 auto 也拦截', () => {
  const v = evaluate({ tool: 'close_exterior_lights', ambiguity: {} }, ctx({ gear: 'D', permissions: { ...DEFAULT_PERMISSIONS, lights: 'auto' } }));
  assert.equal(v.outcome, 'reject');
});

test('P 挡关闭车外灯光 → 放行（授权 auto 时直接执行）', () => {
  const v = evaluate({ tool: 'close_exterior_lights', ambiguity: {} }, ctx({ gear: 'P' }));
  assert.equal(v.outcome, 'execute');
});

test('D 挡关阅读灯（低风险）→ 直接执行：拦截的是风险，不是灯光类别', () => {
  const v = evaluate({ tool: 'close_reading_light', ambiguity: {} }, ctx({ gear: 'D', permissions: { ...DEFAULT_PERMISSIONS, lights: 'auto' } }));
  assert.equal(v.outcome, 'execute');
});

test('涉钱不可逆操作在 D 挡 → 停车后继续，而不是弹更强的窗', () => {
  const v = evaluate({ tool: 'pay', ambiguity: {} }, ctx({ gear: 'D' }));
  assert.equal(v.outcome, 'defer');
});

test('同一支付请求在 P 挡 → 请求确认（涉钱仍需确认，不直接执行）', () => {
  const v = evaluate({ tool: 'pay', ambiguity: {} }, ctx({ gear: 'P' }));
  assert.equal(v.outcome, 'confirm');
});

test('影响第三方（发消息）→ 即使授权 auto 也需确认', () => {
  const v = evaluate({ tool: 'send_message', ambiguity: {} }, ctx({ permissions: { ...DEFAULT_PERMISSIONS, communication: 'auto' } }));
  assert.equal(v.outcome, 'confirm');
});

test('改变行程（导航改道）→ 请求确认', () => {
  const v = evaluate({ tool: 'navigate_route', ambiguity: {} }, ctx({ permissions: { ...DEFAULT_PERMISSIONS, navigation: 'auto' } }));
  assert.equal(v.outcome, 'confirm');
});

// ---------- 歧义测试：缺必要参数时先询问，不猜测执行 ----------

test('缺少必要参数 → 澄清，不执行', () => {
  const v = evaluate({ tool: 'find_poi', ambiguity: { missing: ['距离偏好'] } }, ctx());
  assert.equal(v.outcome, 'clarify');
});

test('多候选并列 → 澄清，并列出候选', () => {
  const v = evaluate({ tool: 'navigate_route', ambiguity: { candidates: ['公司（总部）', '公司（分部）'] } }, ctx());
  assert.equal(v.outcome, 'clarify');
  assert.ok(v.reasons.some((r) => r.includes('候选')));
});

// ---------- 恢复测试：断网、失败之后都有下一步 ----------

test('断网时云端工具 → 显式降级，不假装可用', () => {
  const v = evaluate({ tool: 'find_poi', ambiguity: {} }, ctx({ network: false }));
  assert.equal(v.outcome, 'offline');
});

test('断网时本地车控不受影响', () => {
  const v = evaluate({ tool: 'set_temperature', ambiguity: {} }, ctx({ network: false }));
  assert.equal(v.outcome, 'execute');
});

test('工具执行故障 → 返回失败而不是伪装成功', () => {
  const s = createVehicleState();
  const r = executeTool('set_temperature', { target: 24 }, s, { toolFailure: true });
  assert.equal(r.ok, false);
  assert.equal(s.temperature, 22, '失败时不得改动真相状态');
});

// ---------- 一致性测试：回显、撤销与真相之源一致 ----------

test('执行回显与状态一致，撤销恢复原值', () => {
  const s = createVehicleState();
  const r = executeTool('set_temperature', { target: 24 }, s);
  assert.equal(r.ok, true);
  assert.equal(s.temperature, 24);
  assert.match(r.echo, /22°C → 24°C/);
  r.undo();
  assert.equal(s.temperature, 22);
});

test('不可逆动作不提供撤销', () => {
  const s = createVehicleState();
  const r = executeTool('send_message', { to: '张三', text: '晚点到' }, s);
  assert.equal(r.undo, null);
});

// ---------- 确定性测试：同输入同输出 ----------

test('策略层无随机性：同一输入 100 次结果一致', () => {
  const results = new Set();
  for (let i = 0; i < 100; i++) {
    results.add(evaluate({ tool: 'pay', ambiguity: {} }, ctx({ gear: 'D' })).outcome);
  }
  assert.equal(results.size, 1);
});

// ---------- 理解层（规则引擎模式）测试 ----------

test('“我有点冷” → set_temperature，目标温度 +2', () => {
  const i = understand('我有点冷', { temperature: 22 });
  assert.equal(i.tool, 'set_temperature');
  assert.equal(i.params.target, 24);
});

test('“关闭所有灯光” → 候选动作为关外灯（交给策略层拦截，理解层不做安全判断）', () => {
  const i = understand('关闭所有灯光', {});
  assert.equal(i.tool, 'close_exterior_lights');
});

test('“关闭阅读灯” → 精确匹配低风险工具，不扩大解释', () => {
  const i = understand('关闭阅读灯', {});
  assert.equal(i.tool, 'close_reading_light');
});

test('“导航去公司” → 检出多候选歧义', () => {
  const i = understand('导航去公司', {});
  assert.ok(i.ambiguity.candidates.length > 1);
});

test('“关掉它” → 多候选歧义，不猜测执行', () => {
  const i = understand('关掉它', {});
  assert.equal(i.tool, null);
  assert.ok(i.ambiguity.candidates.length > 1);
});

test('超出理解范围 → 如实承认，不装懂', () => {
  const i = understand('给我讲讲量子力学的历史', {});
  assert.equal(i.unknown, true);
});
