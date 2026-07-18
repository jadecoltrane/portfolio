// 模拟车控工具注册表 + 车辆状态真相之源
// 纯 ESM，无 DOM 依赖：浏览器与 node --test 共用。
// 每个工具的元数据即策略层的决策输入（见 demo方案.md 第二节）。

export const TOOLS = {
  set_temperature: {
    label: '空调温度',
    category: 'climate',
    local: true,            // 断网可用
    readOnly: false,
    reversible: true,
    safetyImpact: 'low',    // low | medium | high：错误执行对行车安全的影响
    affectedScope: 'cabin', // cabin | trip | third_party
    money: false,
    allowedGears: ['P', 'D'],
    complexInDrive: false,  // 行驶中完成该操作是否属于高负荷任务
  },
  set_volume: {
    label: '媒体音量',
    category: 'media',
    local: true,
    readOnly: false,
    reversible: true,
    safetyImpact: 'low',
    affectedScope: 'cabin',
    money: false,
    allowedGears: ['P', 'D'],
    complexInDrive: false,
  },
  close_exterior_lights: {
    label: '关闭车外灯光',
    category: 'lights',
    local: true,
    readOnly: false,
    reversible: true,
    safetyImpact: 'high',   // 夜间行驶中关闭外灯 = 直接安全风险（2026-02 多品牌公开事故的教训）
    affectedScope: 'cabin',
    money: false,
    allowedGears: ['P'],    // 仅 P 挡允许；行驶中一律拦截
    complexInDrive: false,
  },
  close_reading_light: {
    label: '关闭阅读灯',
    category: 'lights',
    local: true,
    readOnly: false,
    reversible: true,
    safetyImpact: 'low',
    affectedScope: 'cabin',
    money: false,
    allowedGears: ['P', 'D'],
    complexInDrive: false,
  },
  find_poi: {
    label: '地点检索',
    category: 'navigation',
    local: false,           // 依赖云端
    readOnly: true,         // 只查询，不改变车辆状态
    reversible: true,
    safetyImpact: 'low',
    affectedScope: 'cabin',
    money: false,
    allowedGears: ['P', 'D'],
    complexInDrive: false,
  },
  navigate_route: {
    label: '导航改道',
    category: 'navigation',
    local: false,
    readOnly: false,
    reversible: true,
    safetyImpact: 'medium',
    affectedScope: 'trip',  // 显著改变行程
    money: false,
    allowedGears: ['P', 'D'],
    complexInDrive: false,
  },
  send_message: {
    label: '发送消息',
    category: 'communication',
    local: false,
    readOnly: false,
    reversible: false,      // 发出去收不回
    safetyImpact: 'low',
    affectedScope: 'third_party',
    money: false,
    allowedGears: ['P', 'D'],
    complexInDrive: false,
  },
  pay: {
    label: '支付 / 预约付款',
    category: 'payment',
    local: false,
    readOnly: false,
    reversible: false,
    safetyImpact: 'low',
    affectedScope: 'third_party',
    money: true,
    allowedGears: ['P'],    // 涉钱且不可逆：行驶中不做，停车后继续
    complexInDrive: true,
  },
};

// 用户授权档位：auto（自动执行）/ confirm（每次确认）/ forbid（禁止）
export const DEFAULT_PERMISSIONS = {
  climate: 'auto',
  media: 'auto',
  lights: 'auto',
  navigation: 'confirm',
  communication: 'confirm',
  payment: 'confirm',
};

// 车辆/座舱状态真相之源：所有回显、撤销、界面读数都以它为准
export function createVehicleState() {
  return {
    gear: 'D',              // P | D
    speedKmh: 60,
    network: true,
    temperature: 22,
    volume: 40,
    exteriorLights: true,   // 夜间行驶，外灯开启
    readingLight: true,
    route: '当前路线：公司（默认）',
    pendingTasks: [],       // 停车后继续的任务
  };
}

// 执行工具调用：返回 {ok, echo, undo}；undo 为 null 表示不可撤销
export function executeTool(name, params, state, injections = {}) {
  if (injections.toolFailure) {
    return { ok: false, echo: `${TOOLS[name].label}执行失败（注入的工具故障）`, undo: null };
  }
  switch (name) {
    case 'set_temperature': {
      const prev = state.temperature;
      state.temperature = params.target;
      return {
        ok: true,
        echo: `空调温度 ${prev}°C → ${params.target}°C`,
        undo: () => { state.temperature = prev; return `空调温度已恢复 ${prev}°C`; },
      };
    }
    case 'set_volume': {
      const prev = state.volume;
      state.volume = params.target;
      return {
        ok: true,
        echo: `音量 ${prev} → ${params.target}`,
        undo: () => { state.volume = prev; return `音量已恢复 ${prev}`; },
      };
    }
    case 'close_exterior_lights': {
      const prev = state.exteriorLights;
      state.exteriorLights = false;
      return {
        ok: true,
        echo: '车外灯光已关闭',
        undo: () => { state.exteriorLights = prev; return '车外灯光已恢复'; },
      };
    }
    case 'close_reading_light': {
      const prev = state.readingLight;
      state.readingLight = false;
      return {
        ok: true,
        echo: '阅读灯已关闭',
        undo: () => { state.readingLight = prev; return '阅读灯已恢复'; },
      };
    }
    case 'navigate_route': {
      const prev = state.route;
      state.route = `当前路线：${params.destination}`;
      return {
        ok: true,
        echo: `导航已切换 → ${params.destination}`,
        undo: () => { state.route = prev; return `已恢复原路线（${prev.replace('当前路线：', '')}）`; },
      };
    }
    case 'find_poi':
      return { ok: true, echo: '检索完成（演示数据）', undo: null };
    case 'send_message':
      return { ok: true, echo: `消息已发送给 ${params.to}：“${params.text}”`, undo: null };
    case 'pay':
      return { ok: true, echo: `已完成预约支付：${params.item}（演示数据，未发生真实交易）`, undo: null };
    default:
      return { ok: false, echo: `未知工具 ${name}`, undo: null };
  }
}
