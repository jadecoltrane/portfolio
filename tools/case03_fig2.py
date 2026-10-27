# -*- coding: utf-8 -*-
"""图 2 生成器。节点取自 cases/03-英语口语练习/图2-数据.json,加节点改数据、不改这里。"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
DATA = os.path.join(ROOT, "cases", "03-英语口语练习", "图2-数据.json")
OUT  = os.path.join(ROOT, "assets", "case03", "图2-改版时间线.svg")

W, H = 1240, 520
X0, X1 = 40, 1200
AXIS = 282                      # 轴的 y
UP, DN = 1, -1

def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

def build(d):
    nodes = d["nodes"]
    n = len(nodes)
    span = X1 - X0
    xs = [X0 + span * (i + 0.5) / n for i in range(n)]

    o = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" '
         'font-family="PingFang SC, Noto Sans CJK SC, Microsoft YaHei, sans-serif">' % (W, H)]
    o.append('''  <style>
    .title{font-size:19px;font-weight:700;fill:#1f2937}
    .sub{font-size:12.5px;fill:#6b7280}
    .band{font-size:11.5px;font-weight:700;fill:#6b7280}
    .dt{font-size:11.5px;font-weight:700;fill:#1d4ed8}
    .nt{font-size:12.5px;font-weight:700;fill:#1f2937}
    .nd{font-size:11px;fill:#6b7280}
    .fs{font-size:11.5px;fill:#9ca3af}
    .key{font-size:12.5px;font-weight:700;fill:#1f2937}
  </style>''')
    o.append('<rect width="%d" height="%d" fill="#ffffff"/>' % (W, H))
    o.append('<text x="40" y="42" class="title">%s</text>' % esc(d["title"]))
    o.append('<text x="40" y="64" class="sub">%s</text>' % esc(d["sub"]))

    # 分段带:边界落在指定节点的中点上
    left = X0
    for b in d["bands"]:
        if b["to"] == "end":
            right = X1
        else:
            i = [k for k, nd in enumerate(nodes) if nd["d"] == b["to"]][0]
            right = xs[i] - span / (2.0 * n)
        fill, stroke = ("#eff6ff", "#2563eb") if b.get("accent") else ("#f9fafb", "#e5e7eb")
        o.append('<rect x="%.1f" y="96" width="%.1f" height="22" fill="%s" stroke="%s"/>'
                 % (left, right - left, fill, stroke))
        o.append('<text x="%.1f" y="112" class="band" text-anchor="middle">%s</text>'
                 % ((left + right) / 2, esc(b["label"])))
        left = right

    o.append('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="#9ca3af" stroke-width="1.4"/>'
             % (X0, AXIS, X1, AXIS))

    for i, nd in enumerate(nodes):
        x = xs[i]
        up = (i % 2 == 0)
        mark = nd.get("mark")
        r, col = (5, "#2563eb") if mark == "form" else ((5, "#dc2626") if mark == "worst" else (4, "#9ca3af"))
        o.append('<circle cx="%.1f" cy="%d" r="%d" fill="%s"/>' % (x, AXIS, r, col))
        if up:
            o.append('<line x1="%.1f" y1="%d" x2="%.1f" y2="%d" stroke="#e5e7eb"/>' % (x, AXIS - r, x, AXIS - 48))
            ys = (AXIS - 60, AXIS - 78, AXIS - 96)
        else:
            o.append('<line x1="%.1f" y1="%d" x2="%.1f" y2="%d" stroke="#e5e7eb"/>' % (x, AXIS + r, x, AXIS + 42))
            ys = (AXIS + 60, AXIS + 78, AXIS + 96)
        tx = x - 12
        anchor = ''
        if i == n - 1:
            tx, anchor = X1, ' text-anchor="end"'
        o.append('<text x="%.1f" y="%d" class="dt"%s>%s</text>' % (tx, ys[0] if up else ys[0], anchor, esc(nd["d"])))
        o.append('<text x="%.1f" y="%d" class="nt"%s>%s</text>' % (tx, ys[1] if up else ys[1], anchor, esc(nd["t"])))
        o.append('<text x="%.1f" y="%d" class="nd"%s>%s</text>' % (tx, ys[2] if up else ys[2], anchor, esc(nd["s"])))

    o.append('<line x1="40" y1="414" x2="%d" y2="414" stroke="#e5e7eb"/>' % X1)
    o.append('<text x="40" y="442" class="key">%s</text>' % esc(d["key"]))
    for i, line in enumerate(d["foot"]):
        o.append('<text x="40" y="%d" class="fs">%s</text>' % (468 + i * 22, esc(line)))
    o.append('</svg>')
    return "\n".join(o)

if __name__ == "__main__":
    d = json.load(open(DATA, encoding="utf-8"))
    svg = build(d)
    open(OUT, "w", encoding="utf-8").write(svg)
    sys.stderr.write("wrote %s (%d bytes)\n" % (OUT, len(svg)))
