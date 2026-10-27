# -*- coding: utf-8 -*-
"""图 5 生成器。数字全部来自练习页自己存下来的每日记录(days 集合),
见 cases/03-英语口语练习/图5-数据.json。改数据不改这里。"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
DATA = os.path.join(ROOT, "cases", "03-英语口语练习", "图5-数据.json")
OUT  = os.path.join(ROOT, "assets", "case03", "图5-十五天复习结果.svg")

W = 880
X0, BARW = 150, 520          # 横轴:满格 = 20 张
ROW, GAP = 32, 34
MAXN = 20

def esc(s):
    return (s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))

def build(d):
    rows = d["days"]
    H = 112 + sum(GAP if r.get("break") else ROW for r in rows) + 26 + len(d["footer"]) * 20 + 22
    o = []
    o.append('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" '
             'font-family="PingFang SC, Noto Sans CJK SC, Microsoft YaHei, sans-serif">' % (W, H))
    o.append('''  <style>
    .title{font-size:18px;font-weight:700;fill:#1f2937}
    .sub{font-size:12px;fill:#6b7280}
    .ax{font-size:11px;fill:#6b7280}
    .num{font-size:12px;font-weight:700;fill:#1f2937}
    .lg{font-size:11px;fill:#6b7280}
    .hd{font-size:11px;fill:#9ca3af}
    .brk{font-size:11px;fill:#b45309}
    .bad{font-size:12px;font-weight:700;fill:#dc2626}
    .ft{font-size:12px;fill:#374151}
    .fs{font-size:11px;fill:#9ca3af}
  </style>''')
    o.append('<rect width="%d" height="%d" fill="#ffffff"/>' % (W, H))
    o.append('<text x="40" y="42" class="title">%s</text>' % esc(d["title"]))
    o.append('<text x="40" y="63" class="sub">%s</text>' % esc(d["sub"]))

    # 图例
    ly = 88
    o.append('<rect x="40" y="%d" width="10" height="10" fill="#2563eb" fill-opacity="0.3" '
             'stroke="#2563eb" stroke-dasharray="2 2"/>' % (ly - 9))
    o.append('<text x="56" y="%d" class="lg">记得 · 自己判</text>' % ly)
    o.append('<rect x="152" y="%d" width="10" height="10" fill="#2563eb"/>' % (ly - 9))
    o.append('<text x="168" y="%d" class="lg">记得 · 机器或 AI 判</text>' % ly)
    o.append('<rect x="300" y="%d" width="10" height="10" fill="#b45309"/>' % (ly - 9))
    o.append('<text x="316" y="%d" class="lg">差一点</text>' % ly)
    o.append('<rect x="372" y="%d" width="10" height="10" fill="#dc2626"/>' % (ly - 9))
    o.append('<text x="388" y="%d" class="lg">没想起来</text>' % ly)
    o.append('<text x="700" y="%d" class="hd">记得</text>' % ly)
    o.append('<text x="748" y="%d" class="hd">记得率</text>' % ly)
    o.append('<text x="812" y="%d" class="hd">做了 / 到期</text>' % ly)

    # 满格刻度
    o.append('<line x1="%d" y1="102" x2="%d" y2="102" stroke="#e5e7eb"/>' % (X0, X0 + BARW))
    o.append('<text x="%d" y="99" class="fs" text-anchor="end">满格 20 张</text>' % (X0 + BARW))

    u = BARW / float(MAXN)
    y = 112
    for r in rows:
        if r.get("break"):
            o.append('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="#b45309" '
                     'stroke-dasharray="4 3"/>' % (40, y + 22, W - 40, y + 22))
            o.append('<text x="40" y="%d" class="brk">%s</text>' % (y + 16, esc(r["break"])))
            y += GAP
            continue
        ans = r["done"]; due = r["due"]
        sg, mg, fz, ms = r["self_got"], r["mach_got"], r["fuzzy"], r["miss"]
        top = y + 6
        # 到期但没做的部分:只画一个浅框
        if due > ans:
            o.append('<rect x="%d" y="%d" width="%.1f" height="22" fill="#f9fafb" '
                     'stroke="#e5e7eb" stroke-dasharray="3 3"/>' % (X0, top, due * u))
        x = X0
        if sg:
            o.append('<rect x="%.1f" y="%d" width="%.1f" height="22" fill="#2563eb" '
                     'fill-opacity="0.3" stroke="#2563eb" stroke-dasharray="2 2"/>' % (x, top, sg * u))
            x += sg * u
        for n, c in ((mg, "#2563eb"), (fz, "#b45309"), (ms, "#dc2626")):
            if n:
                o.append('<rect x="%.1f" y="%d" width="%.1f" height="22" fill="%s"/>' % (x, top, n * u, c))
                x += n * u
        o.append('<text x="40" y="%d" class="ax">%s</text>' % (top + 16, esc(r["date"])))
        if r.get("note"):
            o.append('<text x="%d" y="%d" class="fs">%s</text>'
                     % (X0 + max(due, ans) * u + 10, top + 16, esc(r["note"])))
        got = sg + mg
        o.append('<text x="700" y="%d" class="num">%d</text>' % (top + 16, got))
        pct = r.get("pct")
        cls = "bad" if pct == "0%" else "num"
        o.append('<text x="748" y="%d" class="%s">%s</text>' % (top + 16, cls, esc(pct)))
        o.append('<text x="812" y="%d" class="ax">%d / %d</text>' % (top + 16, ans, due))
        y += ROW

    fy = y + 26
    for i, line in enumerate(d["footer"]):
        o.append('<text x="40" y="%d" class="ft">%s</text>' % (fy + i * 20, esc(line)))
    o.append('<text x="40" y="%d" class="fs">%s</text>' % (fy + len(d["footer"]) * 20, esc(d["source"])))
    o.append('</svg>')
    return "\n".join(o)

if __name__ == "__main__":
    d = json.load(open(DATA, encoding="utf-8"))
    svg = build(d)
    open(OUT, "w", encoding="utf-8").write(svg)
    sys.stderr.write("wrote %s (%d bytes)\n" % (OUT, len(svg)))
