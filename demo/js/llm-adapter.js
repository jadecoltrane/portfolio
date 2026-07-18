// LLM 模式适配层（默认关闭）
// 生产形态：浏览器 → 自有 Serverless Function → LLM API（key 只放服务端环境变量）。
// 端点契约：POST { text, context } → 200 { tool, params, ambiguity, say, plan? }
// 返回结构与 nlu.js 的规则引擎完全一致——策略层不关心理解来自规则还是模型，
// 这正是本案的主张：理解层可替换，授权决策必须留在确定性的策略层。
//
// 启用方式：部署一个转发函数（Vercel / Cloudflare Workers 均可），然后在
// index.html 之前定义 window.DEMO_CONFIG = { llmEndpoint: 'https://…/understand' }。

export async function understandViaLLM(text, ctx) {
  const endpoint = globalThis.DEMO_CONFIG?.llmEndpoint;
  if (!endpoint) {
    throw new Error('未配置 LLM 端点（DEMO_CONFIG.llmEndpoint）；当前使用规则引擎模式');
  }
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      context: { gear: ctx.gear, temperature: ctx.temperature, network: ctx.network },
    }),
  });
  if (!res.ok) throw new Error(`LLM 端点返回 ${res.status}`);
  const intent = await res.json();
  if (typeof intent !== 'object' || intent === null) throw new Error('LLM 端点返回格式非法');
  // 防御：端点只允许返回意图结构，工具白名单与授权仍由本地策略层把关
  return { tool: intent.tool ?? null, params: intent.params ?? {}, ambiguity: intent.ambiguity ?? {}, say: intent.say ?? '', plan: intent.plan };
}
