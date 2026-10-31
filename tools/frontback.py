# -*- coding: utf-8 -*-
"""v1 投递版的前后四页：封面 / 个人简介 / 目录 / 结尾。
案例页各自在 pages.py（案例⑤）与后续的案例①脚本里，本文件只管前后页。

⚠️ 页码由下面三个常量算出，**排版定稿后必须与真实页数核对一遍**。
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *
from visual_art import hmi_art

N_FRONT = 3          # 封面 / 简介 / 目录
N_CASE1 = 11         # 案例一 控制中心（含扉页）
N_CASE2 = 9          # 案例二 节日彩蛋（含扉页）
N_CASE3 = 13         # 案例三 英语口语练习（含扉页）
N_EXP   = 1          # GAS 经历页
P_CASE1 = N_FRONT + 1
P_CASE2 = P_CASE1 + N_CASE1
P_CASE3 = P_CASE2 + N_CASE2
P_EXP   = P_CASE3 + N_CASE3
P_END   = P_EXP + N_EXP
N_TOTAL = P_END

M = 120          # 与案例页同一版心（案例页 pages*.py 都用 120）
def eyebrow(t): return T(M, 100, t, size=17, fill=C["faint"], weight=600, ls="3")
def h1(lines, y=208, size=52): return TL(M, y, lines, size=size, lh=1.36, weight=700, fill=C["ink"])
def body(lines, y=340, size=22, fill=None): return TL(M, y, lines, size=size, lh=1.7, fill=fill or C["ink2"])
def rng(a, n): return f"{a}" if n == 1 else f"{a}–{a+n-1}"

# ══════════ 1 封面 ══════════
COVER = page("".join([
 R(0, 0, W, 9, fill="#4e9fff"),
 R(M, 126, 58, 6, fill="#60a5fa", rx=3),
 T(M, 186, "HMI  /  INTERACTION DESIGN  /  2026",
   size=20, fill="#9cacc3", weight=700, ls="2"),
 TL(M, 304, ["智能座舱 UX", "交互设计作品集"],
    size=67, lh=1.32, weight=700, fill="#f8fafc"),
 T(M, 492, "控制中心  ·  多屏事件  ·  交互规范",
   size=22, fill="#a9bfd9"),
 LN(M, 548, 718, 548, stroke="#3b5675", sw=2),
 T(M, 613, "黄佩瑶", size=38, fill="#ffffff", weight=700),
 T(M, 658, "UX / HMI Interaction Designer", size=23, fill="#9eafc8"),
 hmi_art(),
 LN(M, 750, W-M, 750, stroke="#31415a"),
 T(M, 798, "SELECTED WORKS  01  CONTROL CENTER    02  EVENT SYSTEM    03  PERSONAL PRODUCT",
   size=17, fill="#9eaec4", ls="0.8"),
 T(W-M, 798, "38 PAGES", size=18, fill="#a6bbd7", weight=700, anchor="end")
]), bg="#101a2a")

# ══════════ 2 个人简介 ══════════
def _exp(x, y, org, period, lines):
    out = [T(x, y, org, size=20, weight=700, fill=C["ink"]),
           T(x, y+28, period, size=14, fill=C["faint"])]
    out.append(TL(x, y+56, lines, size=15, lh=1.6, fill=C["ink2"]))
    return "".join(out)

ABOUT = page("".join([
 eyebrow("关于我"),
 h1(["主要参与车机系统交互设计。"], y=210, size=50),
 body(["参与控制中心、系统主框架和多模态交互设计，负责交互方案与规范输出。"], 352, size=23),
 LN(M, 404, W-M, 404),

 T(M, 448, "经历", size=15, fill=C["faint"], weight=600, ls="2"),
 _exp(M, 486, "武汉光庭信息技术股份有限公司", "2025.11 – 现在 · UX 设计",
      ["承接车机座舱项目：控制中心控件规范审查、", "系统主框架、GAS 规范适配与开机引导。"]),
 _exp(M+480, 486, "诚迈科技", "2024.11 – 2025.10 · UX 设计",
      ["车机系统核心应用：桌面主题与节日彩蛋系统、", "音乐应用的车机端整合与交互规范。"]),
 _exp(M+960, 486, "jc design", "2024.02 – 2024.10 · UX 设计",
      ["车机主框架相关交互设计，", "按产品需求文档输出交互方案与界面稿。"]),

 LN(M, 650, W-M, 650),
 T(M, 694, "教育", size=15, fill=C["faint"], weight=600, ls="2"),
 TL(M, 728, ["UCD 都柏林大学 · 人机交互 MSc · 2022–2023",
             "成都信息工程大学 · 数字媒体技术 · 2018–2022"], size=16, lh=1.65, fill=C["ink2"]),
 T(M+480, 694, "工具", size=15, fill=C["faint"], weight=600, ls="2"),
 TL(M+480, 728, ["Figma · Sketch · ProtoPie",
                 "HTML / CSS / JavaScript · Python"], size=16, lh=1.65, fill=C["ink2"]),
 T(M+960, 694, "语言", size=15, fill=C["faint"], weight=600, ls="2"),
 TL(M+960, 728, ["中文（母语） · 英语（雅思 6.5）", "日语（基础）"],
    size=16, lh=1.65, fill=C["ink2"]),

 T(M, 838, "车机相关项目均以外部设计服务方身份参与；英语练习为个人项目。", size=14, fill=C["faint"]),
]))

# ══════════ 3 目录 ══════════
def _toc(y, no, title, role, pages, color=None):
    return "".join([
      R(M, y-26, 46, 5, fill=color or C["faint"]),
      T(M, y, no, size=16, fill=color or C["mute"], weight=700, ls="1"),
      T(M+120, y, title, size=30, weight=700, fill=C["ink"]),
      T(M+120, y+34, role, size=17, fill=C["mute"]),
      T(W-M, y, pages, size=26, weight=700, fill=C["ink"], anchor="end"),
      LN(M, y+62, W-M, y+62),
    ])

TOC = page("".join([
 eyebrow("目录"),
 h1(["项目案例与相关经历"], y=200, size=52),
 body(["包括两个量产车机项目、一款个人产品及一项出海适配经历。"], 278, size=22),

 _toc(386, "案例一", "控制中心：配置适配与控件规范", "项目内交付配置补位与选型；后续进行控件一致性审查",
      rng(P_CASE1, N_CASE1), C["acc"]),
 _toc(492, "案例二", "车机节日彩蛋", "项目交互规范、协作结果与后续复盘",
      rng(P_CASE2, N_CASE2), C["teal"]),
 _toc(598, "案例三", "每天十五分钟的英语口语练习", "个人英语练习：先看真实界面，再看判分与迭代",
      rng(P_CASE3, N_CASE3), C["violet"]),
 _toc(704, "经历", "GAS 规范适配", "出海车型的平台规范适配与认证",
      rng(P_EXP, N_EXP), C["mute"]),

 T(M, 828, "案例三是自用产品，界面为真实截图；其余案例的界面均为脱敏重绘，不含甲方品牌、车型与内部资料。",
   size=15, fill=C["faint"]),
]))

# ══════════ 4 结尾 ══════════
def _end_page():
    rows = contact()
    out = [
      eyebrow("结尾"),
      h1(["联系方式与项目说明"], y=236, size=58),
      body(["控制中心案例：车型配置适配及控件一致性审查。",
            "节日彩蛋案例：跨桌面交互、事件响应及安全约束。",
            "英语练习项目：个人产品设计、实际使用与迭代记录。"], 352, size=23),
      LN(M, 520, W-M, 520),
      T(M, 572, "联系", size=15, fill=C["faint"], weight=600, ls="2"),
    ]
    y = 610
    for k, v in rows:
        out.append(T(M, y, k, size=16, fill=C["faint"]))
        out.append(T(M+96, y, v, size=18, fill=C["ink"], weight=600))
        y += 40
    out.append(T(M, 838,
      "车机项目画面为脱敏抽象示意；个人产品为真实截图。均不含甲方内部文件与条款原文。",
      size=14, fill=C["faint"]))
    return page("".join(out))

END = _end_page()

FRONT = [COVER, ABOUT, TOC]
BACK  = [END]
PAGES = FRONT + BACK
