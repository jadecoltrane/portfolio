// 确定性策略层：Demo 的核心证据。
// LLM/规则引擎只提出候选动作；能不能做，由这里的可检查规则决定。
// 输入四类信号：动作风险（工具元数据）× 车辆状态 × 用户授权 × 意图歧义。
// 输出（对应正文的四种结果 + 两个前置/恢复出口）：
//   clarify   —— 理解阶段出口：存在歧义，先澄清再谈执行
//   offline   —— 恢复阶段出口：依赖云端且当前断网，显式降级
//   execute   —— 直接执行（回显 + 可逆动作一键撤销）
//   confirm   —— 请求确认（复述对象与后果）
//   defer     —— 停车后继续（保存任务，P 挡恢复）
//   reject    —— 拒绝执行（说明原因 + 给安全替代）
// 纯函数、无副作用、无随机性：同样输入永远得到同样输出。

import { TOOLS } from './tools.js';

export function evaluate(request, ctx) {
  const { tool, ambiguity } = request;
  const meta = TOOLS[tool];
  const reasons = [];

  if (!meta) {
    return { outcome: 'reject', reasons: ['未注册的工具调用，一律拒绝'] };
  }

  // 0) 意图歧义：缺必要参数或多候选并列 → 先澄清，不猜测执行
  if (ambiguity && (ambiguity.missing?.length || ambiguity.candidates?.length > 1)) {
    if (ambiguity.missing?.length) reasons.push(`缺少必要信息：${ambiguity.missing.join('、')}`);
    if (ambiguity.candidates?.length > 1) reasons.push(`存在多个候选解释：${ambiguity.candidates.join(' / ')}`);
    return { outcome: 'clarify', reasons };
  }

  // 1) 网络前置：云端工具在断网时显式降级，本地工具不受影响
  if (!meta.local && !ctx.network) {
    reasons.push('该能力依赖云端服务，当前网络不可用；本地车控不受影响');
    return { outcome: 'offline', reasons };
  }

  // 2) 用户授权：禁止即拒绝——用户可以收紧授权，系统必须尊重
  const permission = ctx.permissions[meta.category] ?? 'confirm';
  if (permission === 'forbid') {
    reasons.push(`用户已禁止「${categoryLabel(meta.category)}」类操作的语音执行`);
    return { outcome: 'reject', reasons };
  }

  // 3) 安全底线（不可被用户授权降级）：高安全影响的动作在行驶中一律拦截
  if (meta.safetyImpact === 'high' && ctx.gear !== 'P') {
    reasons.push('行驶中执行该操作存在不可接受的安全风险（安全底线，不随用户授权放宽）');
    return { outcome: 'reject', reasons, alternative: '停车挂 P 挡后可执行，或使用物理开关' };
  }

  // 4) 车辆状态门槛：不在允许挡位 → 可保存的任务转“停车后继续”，否则拒绝
  if (!meta.allowedGears.includes(ctx.gear)) {
    if (meta.complexInDrive || meta.money) {
      reasons.push(`该操作${meta.money ? '涉及支付且不可逆' : '属于高负荷任务'}，行驶中不适合完成`);
      return { outcome: 'defer', reasons };
    }
    reasons.push(`当前挡位（${ctx.gear}）不允许该操作`);
    return { outcome: 'reject', reasons };
  }

  // 5) 只读查询：无状态变更，授权允许即执行
  if (meta.readOnly) {
    reasons.push('只读查询，不改变车辆状态');
    return { outcome: 'execute', reasons };
  }

  // 6) 需要确认的三种情形：用户设了每次确认 / 影响第三方 / 不可逆
  if (permission === 'confirm') {
    reasons.push(`用户授权为「每次确认」（${categoryLabel(meta.category)}）`);
    return { outcome: 'confirm', reasons };
  }
  if (meta.affectedScope === 'third_party') {
    reasons.push('操作影响第三方（对方会真实收到），即使授权为自动也需确认');
    return { outcome: 'confirm', reasons };
  }
  if (meta.affectedScope === 'trip') {
    reasons.push('操作会显著改变行程，需确认');
    return { outcome: 'confirm', reasons };
  }
  if (!meta.reversible) {
    reasons.push('动作不可逆，需确认');
    return { outcome: 'confirm', reasons };
  }

  // 7) 低影响、可逆、状态允许、授权自动 → 直接执行 + 回显 + 撤销
  reasons.push('低影响、可逆、车辆状态允许、在用户授权范围内');
  return { outcome: 'execute', reasons };
}

export function categoryLabel(category) {
  return {
    climate: '空调',
    media: '媒体',
    lights: '灯光',
    navigation: '导航',
    communication: '通讯',
    payment: '支付',
  }[category] ?? category;
}

export const OUTCOME_LABELS = {
  clarify: '需要澄清',
  offline: '断网降级',
  execute: '直接执行',
  confirm: '请求确认',
  defer: '停车后继续',
  reject: '拒绝执行',
};
