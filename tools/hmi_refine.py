# -*- coding: utf-8 -*-
"""HMI-only editorial refinements.

Replaces four existing case pages without adding pages or modifying the product
UX variant. All screen-like compositions are abstract, redacted illustrations.
The actual project deliverable is distinguished from 2026 retrospective ideas.
"""
from lib import page, R, T, TL, LN, C, set_theme, esc, W

M = 120

def _head(kicker, title, sub, size=49):
    return [
        T(M, 100, kicker, size=17, fill=C["faint"], weight=700, ls="2"),
        T(M, 195, title, size=size, fill=C["ink"], weight=700),
        T(M, 262, sub, size=21, fill=C["ink2"]),
    ]

def _foot(note):
    return T(M, 849, note, size=15, fill=C["faint"])

def _slot(x,y,letter,kind="plain",width=148):
    fills={"plain":"#f2f6fd","accent":"#dbeafe","shift":"#dcfce7"}
    borders={"plain":"#cfdeee","accent":"#6ca5ef","shift":"#83bc9c"}
    ink={"plain":"#314159","accent":"#1d4ed8","shift":"#126c48"}
    return "".join([
       R(x,y,width,59,fill=fills[kind],stroke=borders[kind],rx=12,sw=1.6),
       T(x+width/2,y+40,letter,size=26,fill=ink[kind],weight=700,anchor="middle")
    ])

def control_queue():
    set_theme(C["acc"])
    o = _head("05 ／ 项目交付　/　配置适配",
       "同一条功能队列适配不同车型。",
       "产品侧规定功能优先级；我定义缺项跳过与槽位填充的交互机制。", size=51)
    o += [
      R(M,309,1360,145,fill="#f4f7fc",stroke="#d7e3f2",rx=16),
      T(149,351,"01  全量优先级队列",size=18,fill="#30425b",weight=700),
      T(149,382,"产品侧定义",size=15,fill=C["mute"]),
    ]
    for i,n in enumerate("ABCDEF"):
        o.append(_slot(395+i*175,355,n,"accent" if n=="C" else "plain",149))
    o += [
      T(149,494,"02  读取当前车型能力",size=18,fill="#30425b",weight=700),
      T(149,523,"按序检查是否具备",size=15,fill=C["mute"]),
      R(M,549,1360,109,fill="#ffffff",stroke="#d9e2ec",rx=16),
      T(149,592,"高配车型",size=22,fill=C["ink"],weight=700),
      T(149,624,"可用 A / B / C / D / E",size=17,fill=C["mute"]),
      R(M,678,1360,109,fill="#f5fbf8",stroke="#acd4c5",rx=16),
      T(149,722,"低配车型",size=22,fill=C["ink"],weight=700),
      T(149,753,"缺少 C · 跳过不留空",size=17,fill="#30765c"),
    ]
    for i,n in enumerate("ABCDE"):
        o.append(_slot(580+i*172,572,n,"accent" if n=="C" else "plain",145))
    for i,n in enumerate("ABDEF"):
        o.append(_slot(580+i*172,701,n,"shift" if n in "DEF" else "plain",145))
    o += [
      T(1160,823,"C 缺失 → D/E 前移，F 自动补位",size=17,
        fill="#126c48",weight=700,anchor="end"),
      _foot("A–F 均为占位符，非真实控件及优先级；已交付的是填充规则，而非功能排名。")
    ]
    return page("".join(o))

def _scenario(x,y,n,heading,before,after,highlight=False):
    w=660
    accent=C["acc"]
    left="#eef1f5"
    right="#e4f1ff"
    out=[
      R(x,y,w,221,fill="#ffffff",stroke="#d9e3ef",sw=1.5,rx=17),
      T(x+24,y+39,n+"  "+heading,size=23,fill=C["ink"],weight=700),
      LN(x+24,y+60,x+w-24,y+60,stroke="#e6ebf1"),
      T(x+28,y+91,"原有问题",size=15,fill=C["mute"],weight=700),
      T(x+375,y+91,"改进提案",size=15,fill=accent,weight=700),
      R(x+27,y+113,262,75,fill=left,rx=12),
      R(x+370,y+113,262,75,fill=right,stroke="#b4d3fa",rx=12),
      T(x+158,y+159,before,size=18,fill="#526071",weight=600,anchor="middle"),
      T(x+501,y+159,after,size=18,fill="#2156a0",weight=700,anchor="middle"),
      T(x+333,y+160,"→",size=29,fill="#6998ce",weight=700,anchor="middle"),
    ]
    return "".join(out)

def control_proposals():
    set_theme(C["acc"])
    o=_head("09 ／ 后续审查　/　提案示意",
       "四类控件问题的改进方案示意。",
       "依据 2026 年一致性审查整理的示例；尚未确认正式采纳或上线。", size=46)
    o += [
      _scenario(120,321,"01","持续状态","按下即复位","常显 · 已开启"),
      _scenario(820,321,"02","多状态选型","控件类型混用","按状态数判断"),
      _scenario(120,566,"03","执行链路","只显示加载中","失败 · 超时 · 重试"),
      _scenario(820,566,"04","功能不可用","仅灰化禁用","显示原因与恢复条件"),
      _foot("2026 年个人审查提案，未确认正式采纳；原项目交付见本案例前半部分。"),
    ]
    return page("".join(o))

def _eventline(y,num,scene,trigger,behavior,attention=False):
    border="#f0c2b9" if attention else "#cee5e0"
    color="#b91c1c" if attention else "#08796d"
    pale="#fff7f4" if attention else "#f5fbfa"
    o=[
     R(M,y,1360,132,fill="#ffffff",stroke="#dfe8e6",rx=18),
     R(M+22,y+21,60,30,fill=pale,rx=15),
     T(M+52,y+43,num,size=16,fill=color,weight=700,anchor="middle"),
     T(222,y+33,"用户情境",size=15,fill=C["mute"],weight=600),
     T(222,y+81,scene,size=21,fill=C["ink"],weight=700),
     T(540,y+82,"→",size=30,fill="#91a9aa",weight=700,anchor="middle"),
     T(601,y+33,"系统事件",size=15,fill=C["mute"],weight=600),
     T(601,y+81,trigger,size=21,fill=C["ink2"],weight=600),
     T(1002,y+82,"→",size=30,fill="#91a9aa",weight=700,anchor="middle"),
     R(1050,y+22,404,89,fill=pale,stroke=border,rx=13),
     T(1071,y+52,"交互响应 / 优先级",size=14,fill=color,weight=700),
     T(1071,y+84,behavior,size=18,fill=color,weight=700),
    ]
    return "".join(o)

def festival_constraints():
    set_theme(C["teal"])
    o=_head("02 ／ 驾驶场景　/　交互边界",
       "驾驶场景中，彩蛋需要响应高优先级事件。",
       "按地图拖动、语音唤醒及紧急警告三个情境，说明桌面级响应规则。", size=48)
    o += [
       T(120,314,"三个典型情境  /  基于已交付的桌面级规则抽象绘制",size=17,
         fill="#098679",weight=700),
       _eventline(349,"01","导航桌面","地图拖动","挂件弱化、不可操作"),
       _eventline(502,"02","语音交互","语音 GUI 唤醒","由语音界面覆盖相应区域"),
       _eventline(655,"03","安全紧急状态","SOS / 热失控等","按打断类处理 · 安全优先",True),
       T(120,814,"取舍说明：地图拖动时采用弱化而非直接终止，以保留恢复时的连续性；尚无用户测试结论。",
         size=15,fill="#08796d"),
       _foot("交互响应为抽象示意，并非客户实屏；安全相关界面由原系统负责。"),
    ]
    return page("".join(o))

def _decision(y,name,desc,bg,border,ink):
    return "".join([
      R(824,y,625,76,fill=bg,stroke=border,rx=13),
      T(853,y+44,name,size=23,fill=ink,weight=700),
      T(973,y+44,desc,size=18,fill=C["ink2"]),
    ])

def festival_arbitration():
    set_theme(C["teal"])
    o=_head("08 ／ 原项目交付 × 后续复盘",
       "原项目二元分类与后续四级复盘对照。",
       "左侧为原项目交付分类，右侧为 2026 年个人复盘提出的细分模型。",size=47)
    o += [
      R(120,329,640,449,fill="#f4f8f8",stroke="#d6e6e3",rx=17),
      T(149,373,"原项目交付",size=25,fill="#08796d",weight=700),
      T(149,400,"二元归类  /  按桌面补充具体行为",size=16,fill=C["mute"]),
      R(149,435,580,133,fill="#ffffff",stroke="#cbded9",rx=14),
      T(173,476,"不打断",size=24,fill="#08796d",weight=700),
      T(173,513,"语音唤醒、地图拖动、系统反馈等",size=18,fill=C["ink2"]),
      T(173,541,"具体显示与遮挡行为逐场景定义",size=16,fill=C["mute"]),
      R(149,586,580,141,fill="#fff5f2",stroke="#efcabf",rx=14),
      T(173,628,"打断",size=24,fill="#bd3d2e",weight=700),
      T(173,667,"紧急警告、倒车影像、主动切换主题等",size=18,fill=C["ink2"]),
      T(173,697,"安全相关事件优先，按原系统规则让位",size=16,fill=C["mute"]),
      R(790,329,690,449,fill="#ffffff",stroke="#d8e3e1",rx=17),
      T(824,373,"2026 年复盘提案",size=25,fill="#284c56",weight=700),
      T(824,400,"四种响应候选  /  尚无采纳与上线结论",size=16,fill=C["mute"]),
      _decision(429,"继续","状态保持，通常无需恢复",
                "#f5f7f9","#d8e0e8","#475569"),
      _decision(516,"弱化","降低视觉或动效干扰，可恢复",
                "#f4fbf8","#cce7da","#08796d"),
      _decision(603,"暂停","停交互并保留进度，等待恢复",
                "#fffbeb","#f4ddb0","#a16207"),
      _decision(690,"终止","隐藏并清除状态，不续播",
                "#fff5f2","#f0c2b9","#b91c1c"),
      _foot("左侧为当年二元分类的摘要，右侧是后期更细的分析模型；两者不可混同。")
    ]
    return page("".join(o))

def refined_control(original):
    """Keep case length and identities, override only HMI pages 7 and 13."""
    if len(original)!=11:
        raise ValueError("Expected 11 control-center pages")
    result=original.copy()
    result[3]=control_queue()
    result[9]=control_proposals()
    return result

def refined_festival(original):
    """Keep festival case length; override HMI pages 17 and 21."""
    if len(original)!=9:
        raise ValueError("Expected 9 festival pages")
    result=original.copy()
    result[2]=festival_constraints()
    result[6]=festival_arbitration()
    return result
