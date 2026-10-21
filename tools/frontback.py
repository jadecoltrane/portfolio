# -*- coding: utf-8 -*-
"""v1 投递版的前后四页：封面 / 个人简介 / 目录 / 结尾。
案例页各自在 pages.py（案例⑤）与后续的案例①脚本里，本文件只管前后页。

⚠️ 页码由下面三个常量算出，**排版定稿后必须与真实页数核对一遍**。
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *

N_FRONT = 3          # 封面 / 简介 / 目录
N_CASE1 = 9          # 案例一 控制中心（v1 8–9 页，按 9 排）
N_CASE2 = 8          # 案例二 节日彩蛋（已导出）
N_EXP   = 1          # GAS 经历页
P_CASE1 = N_FRONT + 1
P_CASE2 = P_CASE1 + N_CASE1
P_EXP   = P_CASE2 + N_CASE2
P_END   = P_EXP + N_EXP
N_TOTAL = P_END

M = 96
def rng(a, n): return f"{a}" if n == 1 else f"{a}–{a+n-1}"

# ══════════ 1 封面 ══════════
COVER = page("".join([
 R(0, 0, W, 10, fill=C["ink"]),
 T(M, 150, "作品集 ／ PORTFOLIO", size=17, fill=C["faint"], weight=600, ls="3"),
 TL(M, 300, ["我做的是系统级规则设计，", "不是页面设计。"],
    size=74, lh=1.3, weight=700, fill=C["ink"]),
 LN(M, 520, 420, 520, stroke=C["acc"], sw=3),
 T(M, 580, "黄佩瑶 · UX Designer", size=30, weight=700, fill=C["ink"]),
 T(M, 622, "智能座舱 HMI 交互设计", size=22, fill=C["mute"]),
 LN(M, 742, W-M, 742),
 T(M, 782, "控制中心：控件规范审查　／　车机节日彩蛋：事件仲裁　／　GAS 规范适配（经历）",
   size=16, fill=C["faint"]),
 T(W-M, 782, "2026", size=16, fill=C["faint"], anchor="end"),
]))

# ══════════ 2 个人简介 ══════════
def _exp(x, y, org, period, lines):
    out = [T(x, y, org, size=20, weight=700, fill=C["ink"]),
           T(x, y+28, period, size=14, fill=C["faint"])]
    out.append(TL(x, y+56, lines, size=15, lh=1.6, fill=C["ink2"]))
    return "".join(out)

ABOUT = page("".join([
 eyebrow("关于我"),
 h1(["我的产出通常不是一屏界面，", "是一套别人能照着执行的规则。"], y=200, size=50),
 body(["专注智能座舱的 UX 设计师，做 HMI 交互、多模态整合与系统级规范。"], 352, size=23),
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

 T(M, 838, "本作品集中的项目均以外部设计服务方身份承接。", size=14, fill=C["faint"]),
]))

# ══════════ 3 目录 ══════════
def _toc(y, no, title, role, pages):
    return "".join([
      T(M, y, no, size=16, fill=C["acc"], weight=700, ls="1"),
      T(M+120, y, title, size=30, weight=700, fill=C["ink"]),
      T(M+120, y+34, role, size=17, fill=C["mute"]),
      T(W-M, y, pages, size=26, weight=700, fill=C["ink"], anchor="end"),
      LN(M, y+62, W-M, y+62),
    ])

TOC = page("".join([
 eyebrow("目录"),
 h1(["两个案例，一条主线。"], y=206, size=52),
 body(["一个管「让同类的东西长得一样」，一个管「让不同的东西共处一屏」。"], 286, size=22),

 _toc(400, "案例一", "控制中心：控件规范审查", "规则的统一——同类交互被建成不同模型",
      rng(P_CASE1, N_CASE1)),
 _toc(512, "案例二", "车机节日彩蛋", "规则的仲裁——驾驶安全约束下的事件让位",
      rng(P_CASE2, N_CASE2)),
 _toc(624, "经历", "GAS 规范适配", "出海车型的平台规范适配与认证",
      rng(P_EXP, N_EXP)),

 T(M, 786, "全部界面均为脱敏重绘，不含甲方品牌、车型与内部资料。",
   size=15, fill=C["faint"]),
]))

# ══════════ 4 结尾 ══════════
def _end_page():
    rows = contact()
    out = [
      eyebrow("结尾"),
      h1(["我想去定第一版的规则。"], y=236, size=58),
      body(["这两个案例里的规则，都是补进一套已经在跑的系统里的——",
            "面板的选型依据、彩蛋的让位边界。难在没有重来的机会。",
            "下一步，我想从第一版就参与。"], 352, size=23),
      LN(M, 520, W-M, 520),
      T(M, 572, "联系", size=15, fill=C["faint"], weight=600, ls="2"),
    ]
    y = 610
    for k, v in rows:
        out.append(T(M, y, k, size=16, fill=C["faint"]))
        out.append(T(M+96, y, v, size=18, fill=C["ink"], weight=600))
        y += 40
    out.append(T(M, 838,
      "作品集中的界面均为脱敏重绘；不含甲方品牌、车型、内部文档与规范条款原文。",
      size=14, fill=C["faint"]))
    return page("".join(out))

END = _end_page()

FRONT = [COVER, ABOUT, TOC]
BACK  = [END]
PAGES = FRONT + BACK
