# -*- coding: utf-8 -*-
"""产品交互 UX 岗精选版的前后页。

仅重排已有真实案例，不改变案例正文、事实或归属。
内容：封面／关于我／目录／英语练习 13 页／控制中心 11 页／结尾 = 28 页。
"""
from lib import *

set_theme(None)

M = 120
N_FRONT = 3
N_CASE_A = 13            # 英语口语练习，含扉页
N_CASE_B = 11            # 控制中心，含扉页
P_CASE_A = N_FRONT + 1
P_CASE_B = P_CASE_A + N_CASE_A
P_END = P_CASE_B + N_CASE_B
N_TOTAL = P_END


def _eyebrow(t):
    return T(M, 100, t, size=17, fill=C["faint"], weight=600, ls="3")


def _line(y):
    return LN(M, y, W-M, y)


def _toc(y, n, title, detail, pages, color):
    return "".join([
        R(M, y-27, 48, 5, fill=color),
        T(M, y, n, size=17, fill=color, weight=700),
        T(M+130, y, title, size=31, fill=C["ink"], weight=700),
        T(M+130, y+43, detail, size=18, fill=C["mute"]),
        T(W-M, y, pages, size=27, fill=C["ink"], anchor="end", weight=700),
        _line(y+80),
    ])


COVER = page("".join([
    R(0, 0, W, 10, fill=C["ink"]),
    T(M, 150, "作品集 ／ PRODUCT UX PORTFOLIO", size=17, fill=C["faint"], weight=600, ls="3"),
    TL(M, 290, ["从真实问题出发，", "把规则做成能用的产品。"],
       size=68, lh=1.33, weight=700, fill=C["ink"]),
    LN(M, 522, 520, 522, stroke=C["violet"], sw=4),
    T(M, 596, "黄佩瑶 · UX / Interaction Designer", size=31, fill=C["ink"], weight=700),
    T(M, 638, "产品交互 · 体验规则 · 可验证的设计决策", size=22, fill=C["mute"]),
    _line(742),
    T(M, 784, "英语口语练习（个人项目）　／　控制中心（量产项目）",
      size=18, fill=C["faint"]),
    T(W-M, 784, "2026", size=17, fill=C["faint"], anchor="end"),
]))

ABOUT = page("".join([
    _eyebrow("关于我"),
    TL(M, 205, ["我关心一套设计规则，", "最终有没有让事情变得更好做。"],
       size=52, lh=1.35, weight=700, fill=C["ink"]),
    TL(M, 347, ["我做过量产车机系统交互，也为自己定义和迭代了一套每天使用的英语练习产品。",
                "这两种工作共享同一件事：识别约束、比较方案、定义规则，再回头核对它是否有效。"],
       size=21, lh=1.7, fill=C["ink2"]),
    _line(466),
    R(M, 502, 650, 194, fill=C["wash"], stroke=C["line"], rx=10),
    R(830, 502, 650, 194, fill=C["wash"], stroke=C["line"], rx=10),
    T(M+28, 546, "个人产品 · 从定义到使用", size=22, weight=700),
    TL(M+28, 594, ["定义教学流程、题型、判分与反馈规则；",
                    "让日常使用数据反过来修正产品设计。"],
       size=19, lh=1.62, fill=C["ink2"]),
    T(858, 546, "量产项目 · 在既有系统里做决策", size=22, weight=700),
    TL(858, 594, ["负责车机交互与控件规范一致性审查；",
                  "把零散判断收敛成可查、可执行的规则。"],
       size=19, lh=1.62, fill=C["ink2"]),
    _line(730),
    T(M, 774, "背景", size=16, fill=C["faint"], weight=600, ls="2"),
    T(M+105, 774, "近三年车机 UX 经验 · 都柏林大学 人机交互 MSc", size=19, fill=C["ink2"]),
    T(M, 822, "能力", size=16, fill=C["faint"], weight=600, ls="2"),
    T(M+105, 822, "交互设计 · 规则设计 · 信息架构 · Figma · 原型与验证", size=19, fill=C["ink2"]),
]))

TOC = page("".join([
    _eyebrow("目录"),
    TL(M, 207, ["两个项目，两种验证设计的方式。"], size=53, weight=700, fill=C["ink"]),
    T(M, 291, "先看一个每天在用的个人产品，再看量产系统里的规则设计。", size=23, fill=C["ink2"]),
    _toc(430, "案例一", "每天十五分钟的英语口语练习",
         "问题 → 每日练习回路 → 真实界面 → 单用户十五天数据",
         f"{P_CASE_A}–{P_CASE_B-1}", C["violet"]),
    _toc(600, "案例二", "控制中心：控件规范审查",
         "状态矩阵 → 控件选型表 → 交付清单；采纳结论仍待确认",
         f"{P_CASE_B}–{P_END-1}", C["acc"]),
    T(M, 800, "个人项目的数据只有一名使用者；量产项目以脱敏交互稿呈现，不含甲方内部资料。",
      size=18, fill=C["mute"]),
]))


def _ending():
    rows = contact()
    out = [
        _eyebrow("结尾"),
        TL(M, 232, ["希望把设计判断，", "做成能持续验证的体验。"],
           size=60, lh=1.33, weight=700, fill=C["ink"]),
        TL(M, 407, ["个人项目让我看见规则的结果，也看见单用户数据的边界。",
                    "量产项目让我学会在既有约束里，把团队需要反复讨论的判断写清楚。",
                    "下一步，我希望参与从问题定义到上线迭代的完整过程。"],
           size=23, lh=1.7, fill=C["ink2"]),
        _line(572),
        T(M, 626, "联系", size=16, fill=C["faint"], weight=700, ls="2"),
    ]
    y = 670
    for label, value in rows:
        out += [T(M, y, label, size=17, fill=C["mute"]),
                T(M+108, y, value, size=20, fill=C["ink"], weight=600)]
        y += 43
    out.append(T(M, 860, "量产案例的品牌、车型与内部文件均已脱敏；个人项目界面为本人产品截图。",
                 size=16, fill=C["faint"]))
    return page("".join(out))


END = _ending()
FRONT = [COVER, ABOUT, TOC]
BACK = [END]
