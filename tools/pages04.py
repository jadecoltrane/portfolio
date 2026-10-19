# -*- coding: utf-8 -*-
"""案例④ GAS 规范适配：一页经历页。
不是 case study——具体改动由产品侧定义，本页只交付关键词与事实。
"""
from lib import *

M = 120
def eyebrow(t): return T(M, 100, t, size=17, fill=C["faint"], weight=600, ls="3")

EXP = page("".join([
 eyebrow("经历 ／ GAS 规范适配　　出海车型 · 已通过认证"),
 TL(M, 206, ["这一轮适配里，删除多于新增。"], size=54, lh=1.34, weight=700, fill=C["ink"]),
 TL(M, 300, ["权限、通知管理、应用管理、语音这几类能力按规范由平台统一承担，",
             "车厂自建的那一份就要退场。"], size=22, lh=1.7, fill=C["ink2"]),

 R(M, 400, 640, 300, fill=C["wash"], stroke=C["line"], rx=10),
 T(M+32, 444, "这段经历是什么", size=15, fill=C["mute"], weight=700, ls="2.4"),
 TL(M+32, 490, ["AAOS 是车载操作系统平台，GAS 是可集成在其上的",
                "Google 服务套件。出海车型要完成 GAS 规范适配",
                "并通过认证——对设计侧，这意味着现有方案要与",
                "规范逐条比对，确认差距、判断适用性、逐项决定",
                "怎么改。"], size=19, lh=1.72, fill=C["ink2"]),

 R(820, 400, 660, 300, fill="#ffffff", stroke=C["line"], rx=10),
 T(852, 444, "我在里面做了什么", size=15, fill=C["mute"], weight=700, ls="2.4"),
 TL(852, 490, ["参与前期合规决策与逐条复核；",
               "负责主框架与开机引导两个模块的适配落地。",
               "项目已通过认证。"], size=19, lh=1.72, fill=C["ink"]),
 LN(852, 600, 1448, 600),
 TL(852, 636, ["审查流程为团队协作建立，非本人搭建；",
               "具体改动由产品侧定义，本人负责落地。"], size=17, lh=1.64, fill=C["mute"]),

 LN(M, 752, 1480, 752),
 T(M, 792, "参与合规决策 · 主框架与开机引导适配落地", size=19, weight=700),
 T(M, 822, "角色", size=14, fill=C["faint"], ls="2"),
 T(760, 792, "以外部设计服务方身份承接", size=19, weight=700),
 T(760, 822, "交付关系", size=14, fill=C["faint"], ls="2"),
 T(1180, 792, "AAOS · GAS · 出海合规 · 已通过认证", size=19, weight=700, fill=C["acc"]),
 T(1180, 822, "关键词", size=14, fill=C["faint"], ls="2"),

 T(M, 868, "合作规范对厂商保密：全文不引条款原文、不出现条款编号，不出现品牌与车型。",
   size=14, fill=C["faint"]),
]))

PAGES = [EXP]
