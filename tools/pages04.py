# -*- coding: utf-8 -*-
"""案例④ GAS 规范适配：一页经历页。
不是 case study——具体改动由产品侧定义，本页只交付关键词与事实。
2026-10-20：按项目侧既有的四类适配策略重排版面。四类不是本人划的，页内写明。
"""
from lib import *

M = 120
def eyebrow(t): return T(M, 100, t, size=17, fill=C["faint"], weight=600, ls="3")

# 四类适配策略（项目侧既有框架，非本人划分）；全部去品牌化
CATS = [
    ("01", "重构", C["acc"],    ["原方案与规范存在", "结构性差异，要重新", "定义"],   "设置层级与入口 · 多媒体"),
    ("02", "融合", C["indigo"], ["原方案基本满足，", "按规范补充状态、", "入口或说明"],   "账号体系 · 隐私授权 · 开机引导"),
    ("03", "替换", C["warn"], ["自建能力退场，", "改由平台的同类服务", "承接"],       "地图 · 语音助理"),
    ("04", "保留", C["mute"],   ["原方案已满足规范，", "继续使用"],                     "车辆控制 · 品牌视觉"),
]

def cat_card(i, num, name, color, lines, eg):
    x = M + i * 345
    out = [R(x, 410, 325, 232, fill=C["wash"], stroke=C["line"], rx=10),
           R(x, 410, 325, 4, fill=color),
           T(x+24, 456, num, size=15, fill=C["faint"], weight=700, ls="2"),
           T(x+24, 492, name, size=30, fill=color, weight=700),
           TL(x+24, 538, lines, size=15, lh=1.62, fill=C["mute"]),
           LN(x+24, 596, x+301, 596),
           T(x+24, 624, eg, size=14, fill=C["ink2"])]
    return "".join(out)

EXP = page("".join([
 eyebrow("经历 ／ GAS 规范适配　　出海车型 · 已通过认证"),
 TL(M, 206, ["这一轮适配里，删除多于新增。"], size=54, lh=1.34, weight=700, fill=C["ink"]),
 TL(M, 300, ["适配不是照着规范加功能。每个模块先落到四类策略里的一类——",
             "而最沉的那一类是「替换」：车厂自建的能力要退场，交给平台。"],
    size=22, lh=1.7, fill=C["ink2"]),

 T(M, 384, "项目侧的四类适配策略（该分类为项目既有框架，非本人划分）",
   size=15, fill=C["mute"], weight=700, ls="2"),
 "".join(cat_card(i, *c) for i, c in enumerate(CATS)),

 R(M, 666, 1360, 86, fill="#ffffff", stroke=C["line"], rx=10),
 T(M+24, 702, "我在里面做了什么", size=15, fill=C["mute"], weight=700, ls="2.4"),
  T(M+218, 702, "参与前期合规决策与逐条复核；负责主框架与开机引导两个模块的适配落地。",
   size=19, fill=C["ink"]),
  T(M+218, 732, "审查流程为团队协作建立，非本人搭建；具体改动由产品侧定义，本人负责落地。",
   size=16, fill=C["mute"]),

 LN(M, 788, 1480, 788),
 T(M, 820, "参与合规决策 · 主框架与开机引导适配落地", size=19, weight=700),
 T(M, 848, "角色", size=14, fill=C["faint"], ls="2"),
 T(760, 820, "以外部设计服务方身份承接", size=19, weight=700),
 T(760, 848, "交付关系", size=14, fill=C["faint"], ls="2"),
 T(1180, 820, "AAOS · GAS · 出海合规 · 已通过认证", size=19, weight=700, fill=C["acc"]),
 T(1180, 848, "关键词", size=14, fill=C["faint"], ls="2"),

 T(M, 886, "合作规范对厂商保密：全文不引条款原文、不出现条款编号，不出现品牌与车型。",
   size=14, fill=C["faint"]),
]))

PAGES = [EXP]
