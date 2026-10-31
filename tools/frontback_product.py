# -*- coding: utf-8 -*-
"""产品交互 UX 岗精选版的前后页。

仅重排已有真实案例，不改变案例正文、事实或归属。
内容：封面／关于我／目录／英语练习 13 页／控制中心 11 页／结尾 = 28 页。
"""
from lib import *
from visual_art import product_art

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
    R(0, 0, W, 9, fill="#9273ec"),
    R(M, 126, 58, 6, fill="#a89af7", rx=3),
    T(M, 186, "PRODUCT UX  /  INTERACTION DESIGN  /  2026",
      size=19, fill="#aba4d3", weight=700, ls="2"),
    TL(M, 304, ["产品 UX 与", "交互设计作品集"],
       size=64, lh=1.35, weight=700, fill="#f8fafc"),
    T(M, 492, "个人练习产品  ·  系统交互  ·  决策与反馈",
      size=21, fill="#b6aedb"),
    LN(M, 548, 718, 548, stroke="#494464", sw=2),
    T(M, 613, "黄佩瑶", size=38, fill="#ffffff", weight=700),
    T(M, 658, "UX / Product Interaction Designer",
      size=22, fill="#b4afd4"),
    product_art(),
    LN(M, 750, W-M, 750, stroke="#3a395b"),
    T(M, 798, "SELECTED WORKS  01  DAILY PRACTICE    02  CONTROL CENTER",
      size=17, fill="#aaa8cf", ls="0.8"),
    T(W-M, 798, "28 PAGES", size=18, fill="#b3a7e6",
      weight=700, anchor="end"),
]), bg="#101a2a")

ABOUT = page("".join([
    _eyebrow("关于我"),
    TL(M, 205, ["量产车机交互设计，", "以及一款持续迭代的个人产品。"],
       size=52, lh=1.35, weight=700, fill=C["ink"]),
    TL(M, 347, ["我参与过车机系统交互设计，也独立定义并持续使用一款英语口语练习产品。",
                "案例重点展示我的设计范围、方案选择、交互细节，以及能够核对的结果。"],
       size=21, lh=1.7, fill=C["ink2"]),
    _line(466),
    R(M, 502, 650, 194, fill=C["wash"], stroke=C["line"], rx=10),
    R(830, 502, 650, 194, fill=C["wash"], stroke=C["line"], rx=10),
    T(M+28, 546, "个人项目 · 英语口语练习", size=22, weight=700),
    TL(M+28, 594, ["定义教学流程、题型、判分与反馈规则；",
                    "记录实际使用情况，并据此调整判分规则。"],
       size=19, lh=1.62, fill=C["ink2"]),
    T(858, 546, "量产项目 · 控制中心交互", size=22, weight=700),
    TL(858, 594, ["负责车机交互与控件规范一致性审查；",
                  "输出配置补位机制，并进行后续一致性审查。"],
       size=19, lh=1.62, fill=C["ink2"]),
    _line(730),
    T(M, 774, "背景", size=16, fill=C["faint"], weight=600, ls="2"),
    T(M+105, 774, "近三年车机 UX 经验 · 都柏林大学 人机交互 MSc", size=19, fill=C["ink2"]),
    T(M, 822, "能力", size=16, fill=C["faint"], weight=600, ls="2"),
    T(M+105, 822, "交互设计 · 规则设计 · 信息架构 · Figma · 原型与验证", size=19, fill=C["ink2"]),
]))

TOC = page("".join([
    _eyebrow("目录"),
    TL(M, 207, ["两项交互设计案例"], size=53, weight=700, fill=C["ink"]),
    T(M, 291, "先展示个人产品的界面与迭代，再介绍车机控制中心的交互设计。", size=23, fill=C["ink2"]),
    _toc(430, "案例一", "每天十五分钟的英语口语练习",
         "问题 → 每日练习回路 → 真实界面 → 单用户十五天数据",
         f"{P_CASE_A}–{P_CASE_B-1}", C["violet"]),
    _toc(600, "案例二", "控制中心：控件规范审查",
         "实际交付的补位机制 → 主动审查 → 待采纳的控件改进提案",
         f"{P_CASE_B}–{P_END-1}", C["acc"]),
    T(M, 800, "个人项目的数据只有一名使用者；量产项目以脱敏交互稿呈现，不含甲方内部资料。",
      size=18, fill=C["mute"]),
]))


def _ending():
    rows = contact()
    out = [
        _eyebrow("结尾"),
        TL(M, 232, ["联系方式与", "项目说明"],
           size=60, lh=1.33, weight=700, fill=C["ink"]),
        TL(M, 407, ["英语练习产品包含本人定义的学习流程、交互界面及使用记录。",
                    "车机控制中心案例包含项目内交付的配置机制和后续个人审查提案。",
                    "如需进一步了解项目范围或具体设计判断，欢迎联系。"],
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
