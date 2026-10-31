# -*- coding: utf-8 -*-
"""Case-study reading order for the two *existing* portfolio exports.

Only real, sourced deliverables are described as delivered. Later audit work
and illustrative option comparisons are marked separately. No fake tests,
adoption, user feedback, production screens or impact metrics are introduced.
"""
from lib import page, R, T, TL, LN, C, set_theme
import hmi_refine

M=120

def _head(kicker, title, subtitle, fs=48):
    return [T(M,100,kicker,size=17,fill=C["faint"],weight=700,ls="2"),
            T(M,200,title,size=fs,fill=C["ink"],weight=700),
            T(M,261,subtitle,size=20,fill=C["ink2"])]

def _small(text):
    return T(M,851,text,size=14,fill=C["faint"])

def _card(x,y,w,h,tag,headline,lines,accent="#2563eb"):
    return "".join([
        R(x,y,w,h,fill="#ffffff",stroke="#dce5ef",rx=18),
        R(x,y,6,h,fill=accent,rx=3),
        T(x+26,y+40,tag,size=16,fill=accent,weight=700),
        T(x+26,y+87,headline,size=26,fill=C["ink"],weight=700),
        TL(x+26,y+133,lines,size=18,lh=1.6,fill=C["ink2"]),
    ])

def control_choice():
    """Illustrative *retrospective* comparison; not a claimed formal A/B test."""
    set_theme(C["acc"])
    o=_head("04 ／ 机制选择　/　基于交付方案的事后说明",
            "为什么使用统一队列，而不是维护两套默认布局？",
            "这是对既有需求和已交付机制的逻辑比较，不是当年的正式方案评审记录。",fs=43)
    o += [
      _card(M,333,660,355,"做法 A  /  比较用假设","不同配置分别维护布局",
            ["每增加一种配置，就需要维护相应的默认顺序。",
             "当同一功能在不同车型缺失时，",
             "还需要分别检查各自的槽位。"],"#8796a8"),
      _card(820,333,660,355,"做法 B  /  项目实际采用的机制","一条全量队列 + 缺项补位",
            ["产品侧维护功能优先次序。",
             "我定义按配置过滤不可用功能，",
             "然后按队列顺序补齐有限槽位。"],"#2563eb"),
      LN(M,735,1480,735,stroke="#dbe5ef"),
      T(M,779,"判断依据",size=17,fill=C["mute"],weight=700),
      T(264,779,"尽量减少针对不同配置重复编排默认布局的需求。",size=20,
        fill=C["ink"],weight=700),
      _small("仅展示机制逻辑；没有多版本维护成本、可用性或效果提升的实测数据。")
    ]
    return page("".join(o))

def _stage(x,y,n,tag,head,body,col):
    return "".join([
       R(x,y,396,251,fill="#ffffff",stroke="#dce5ef",rx=16),
       R(x+24,y+24,42,42,fill=col,rx=21),
       T(x+45,y+53,n,size=19,fill="#ffffff",weight=700,anchor="middle"),
       T(x+84,y+55,tag,size=15,fill=C["mute"],weight=700),
       T(x+24,y+122,head,size=26,fill=C["ink"],weight=700),
       TL(x+24,y+162,body,size=17,lh=1.55,fill=C["ink2"])
    ])

def control_delivery():
    set_theme(C["acc"])
    o=_head("06 ／ 项目交付　/　交互规范",
         "我在规范中定义了什么？",
         "交付重点是控件接入方式与不同配置下的默认槽位填充机制。",fs=53)
    o += [
     _stage(120,332,"1","输入条件","功能优先级与车型配置",
           ["优先级由产品侧定义","分区、容量、翻页为既有规则"],"#64748b"),
     _stage(600,332,"2","本人定义","控件接入与缺项处理",
           ["新功能选择对应控件类型","按当前配置跳过缺失功能"],"#2563eb"),
     _stage(1080,332,"3","交付输出","可执行的交互规范",
           ["按照优先序填充现有槽位","不用另维护低配固定序列"],"#138b80"),
     T(552,485,"→",size=30,fill="#8097ad",weight=700),
     T(1032,485,"→",size=30,fill="#8097ad",weight=700),
     R(M,645,1360,142,fill="#eff5fc",stroke="#c8d9ec",rx=16),
     T(153,688,"职责边界",size=18,fill="#2563eb",weight=700),
     TL(153,723,["车型优先级、面板分区及容量不是我的设计；我负责说明它们如何作用于控件接入与缺项补位。",
                  "该机制已写入交互规范，但没有可公开引用的上线效果或用户测试指标。"],
          size=17,lh=1.65,fill=C["ink2"]),
     _small("本页是可公开的流程摘要，不是客户原始规范截图或真实功能配置表。")
    ]
    return page("".join(o))

def control_close():
    set_theme(C["acc"])
    o=_head("10 ／ 交付、后续审查与证据边界",
            "项目期间完成交付；后续审查提出改进建议。",
            "把已完成的工作、尚未采纳的建议和缺失的验证材料分别呈现。",fs=43)
    o += [
       _card(M,333,660,337,"项目期间  /  已交付","配置适配与交互规范",
             ["全量优先序下的缺项自动补位机制，",
              "以及新功能接入时的控件选型。",
              "已写入项目交互规范。"],"#2563eb"),
       _card(820,333,660,337,"2026 年  /  个人审查","一致性问题与改进提案",
             ["完成控件状态横向对照、选型建议",
              "及状态、走查清单等提案。",
              "已反馈团队，未确认正式采纳。"],"#0d9488"),
       LN(M,715,1480,715),
       T(M,753,"尚未验证",size=18,fill=C["mute"],weight=700),
       TL(260,751,["缺少可公开的量产界面、实际用户测试及采纳后的效果数据。",
                  "因此不把复盘示意图表述为已上线改版，也不推断使用效率提升。"],
         size=18,lh=1.7,fill=C["ink2"]),
       _small("两阶段工作独立标注；项目交付结果与个人设计建议不能相互替代。")
    ]
    return page("".join(o))

def control_pages(original):
    """11 pages. Shift weight toward the actual delivery, keep three later-audit pages."""
    if len(original)!=11:
        raise ValueError("Control-center source must contain 11 pages")
    return [original[0],original[1],original[2],original[4],
            control_choice(),hmi_refine.control_queue(),control_delivery(),
            original[6],original[8],hmi_refine.control_proposals(),control_close()]

def festival_pages(original):
    """9 pages: original design artifacts and evidence precede the later review."""
    if len(original)!=9:
        raise ValueError("Festival source must contain 9 pages")
    return [original[0],original[1],hmi_refine.festival_constraints(),
            original[3],original[4],original[5],original[7],original[8],
            hmi_refine.festival_arbitration()]

def english_pages(original):
    """13 pages: show actual user interface early, then problem / decisions / evidence."""
    if len(original)!=13:
        raise ValueError("English source must contain 13 pages")
    return [original[0],original[1],original[9],original[10],
            original[2],original[3],original[4],original[5],
            original[6],original[7],original[8],original[11],original[12]]
