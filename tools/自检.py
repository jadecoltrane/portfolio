# -*- coding: utf-8 -*-
"""版面自检。三件事：图有没有盖住字、字有没有出版心、每页内容量差多少。

    PYTHONPATH=/tmp/pylibs python3 tools/自检.py             # HMI 完整版
    PYTHONPATH=/tmp/pylibs python3 tools/自检.py --product   # 28 页产品 UX 版

配图是后画的，会把底下的字盖掉，这种事纯文字比对看不出来，所以本脚本把
每张图的落位记下来（lib.BOXOF），再拿页面文字去和图框求交集。
量内容量时开 PORTFOLIO_FIG_STUB=1，配图整块换成色块，图内标签不参与计数。
"""
import io, os, sys, tempfile, warnings
warnings.filterwarnings("ignore")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
os.chdir(ROOT)
os.environ["PORTFOLIO_FIG_STUB"] = "1"
os.environ["PORTFOLIO_NO_CONTACT"] = "1"
import fitz, lib

if "--product" in sys.argv:
    import build_product
    ORDER = build_product.collect()
    print("· 检查产品 UX 精选版：期望 28 页")
else:
    lib.use_assets("case01"); import pages01
    lib.use_assets("case05"); import pages
    lib.use_assets("case03"); import pages03
    lib.set_theme(None)
    import frontback, pages04
    import hmi_refine
    ORDER = (frontback.FRONT + hmi_refine.refined_control(pages01.PAGES)
             + hmi_refine.refined_festival(pages.PAGES) + pages03.PAGES
             + pages04.PAGES + frontback.BACK)
    print("· 检查 HMI 完整版：期望 38 页")

# 用和导出同一条渲染路径，否则量的是另一套字体的宽度，压字结果不作数
import render
_tmp = os.path.join(tempfile.mkdtemp(), "check.pdf")
SCALE = render.to_pdf(ORDER, _tmp)      # 页宽 ÷ 1600
doc = fitz.open(_tmp)
expected = 28 if "--product" in sys.argv else 38
if doc.page_count != expected or len(ORDER) != expected:
    raise RuntimeError("版本页数不符：期望 %d，实际 SVG %d／PDF %d"
                       % (expected, len(ORDER), doc.page_count))

def spans(pg):
    for b in pg.get_text("dict")["blocks"]:
        if b["type"] != 0: continue
        for l in b["lines"]:
            for s in l["spans"]:
                if s["text"].strip():
                    r = fitz.Rect(s["bbox"]) * (1 / SCALE)
                    yield r, s["text"].strip(), s["size"] / SCALE

def area(r): return max(0, r.width) * max(0, r.height)

print("—— 图压字（图框盖住字超过 12%）——")
bad = 0
for i, svg in enumerate(ORDER):
    boxes = [fitz.Rect(x, y, x+w, y+h) for x, y, w, h, _ in lib.BOXOF.get(id(svg), [])]
    for r, t, _ in spans(doc[i]):
        for fr in boxes:
            it = r & fr
            if it.is_valid and area(it) > 0.12 * area(r):
                print("  p%02d  %.0f%%  「%s」" % (i+1, 100*area(it)/area(r), t[:34])); bad += 1
                break
print("  共 %d 处" % bad)

print("\n—— 出血（越出版心 120／1480，或低于 y=890）——")
n = 0
for i, pg in enumerate(doc):
    for r, t, _ in spans(pg):
        if r.x0 < 112 or r.x1 > 1488 or r.y1 > 892 or r.y0 < 70:
            print("  p%02d  x0=%.0f x1=%.0f y1=%.0f  %s" % (i+1, r.x0, r.x1, r.y1, t[:34])); n += 1
print("  共 %d 处" % n)

print("\n—— 每页正文量（≥14pt 的字；图内文字不计）——")
cnt = []
for i, pg in enumerate(doc):
    c = sum(len(t) for _, t, sz in spans(pg) if sz >= 13.5)
    nf = len(lib.BOXOF.get(id(ORDER[i]), []))
    cnt.append(c)
    print("  p%02d %4d 图%d %s" % (i+1, c, nf, "█" * int(c/12)))
srt = sorted(cnt)
print("\n  中位数 %d，最少 %d，最多 %d" % (srt[len(srt)//2], srt[0], srt[-1]))
print("  纯文字页收在 140–360 之间；低于 140 的应当是配图页或截图页。")


print("\n—— 行距与文字碰撞（按实际嵌入字体测量）——")
# 本项不同于“图压字”：比较 PDF 里的真实文字行。
# 各列的文字以及卡片的标题/正文分属不同内容块，不可只按 Y 坐标比较。
from statistics import median
def textlines(pg):
    out = []
    for block in pg.get_text("dict")["blocks"]:
        if block["type"] != 0:
            continue
        for line in block["lines"]:
            spans = [s for s in line["spans"] if s["text"].strip()]
            if not spans:
                continue
            rect = fitz.Rect(spans[0]["bbox"])
            for s in spans[1:]:
                rect |= fitz.Rect(s["bbox"])
            rect *= 1 / SCALE
            out.append((rect, "".join(s["text"] for s in spans).strip(),
                        median(s["size"] / SCALE for s in spans)))
    return out

# 行距用相邻行的中心距/字号来量，避免某些 PDF 阅读器的行高视觉差异。
# 1.45 以下标记“偏紧”；1.30 以下标记“拥挤”。
tight, crowd, collisions = [], [], []
for p, pg in enumerate(doc, 1):
    lines = textlines(pg)
    for i, (a, at, az) in enumerate(lines):
        for b, bt, bz in lines[i+1:]:
            if b.y0 < a.y0:
                a_, at_, az_, b_, bt_, bz_ = b, bt, bz, a, at, az
            else:
                a_, at_, az_, b_, bt_, bz_ = a, at, az, b, bt, bz
            overlap = max(0, min(a_.x1,b_.x1)-max(a_.x0,b_.x0))
            if overlap < max(25, 0.35*min(a_.width,b_.width)):
                continue
            if (max(az_,bz_) / min(az_,bz_) > 1.23 or
                    abs(a_.x0-b_.x0) > 85):
                continue
            step = (b_.y0+b_.y1-a_.y0-a_.y1)/2
            ratio = step / max(az_,bz_)
            if ratio < 0.65:
                # 同一视觉行的标签/文案或行内多 span，不算相邻行。
                continue
            if ratio >= 2.1:
                continue
            if ratio < 1.45:
                item = (p, round(ratio,2), at_[:23], bt_[:23])
                tight.append(item)
                if ratio < 1.30:
                    crowd.append(item)
            # 高度实际交叠超过 25%，不是“间距小”而是碰撞风险。
            inter = a_ & b_
            if inter.is_valid and inter.height > 0.25 * min(a_.height, b_.height):
                collisions.append((p, round(inter.height,1), at_[:23], bt_[:23]))

for group, label in ((crowd, "拥挤"), (collisions, "碰撞")):
    print("  %s %d 组%s" % (label, len(group),
          "（仅列前 35 组）" if len(group)>35 else ""))
    for p, v, a, b in group[:35]:
        print("    p%02d  %s  「%s」／「%s」" % (p,v,a,b))
print("  偏紧总计 %d 组（含拥挤；建议逐页检查）" % len(tight))


print("\n—— 全字级文本交叠（严格，含大标题与正文）——")
# 旧检查只比较相近字号，漏掉了 p11「两行大标题压到正文」的真实问题。
# 两个独立文本行的可见字框同时在 X/Y 方向交叠足够大，才视为碰撞。
hard_collisions=[]
for p, pg in enumerate(doc, 1):
    lines = textlines(pg)
    for i, (r, t, sz) in enumerate(lines):
        for q, u, sz2 in lines[i+1:]:
            dx=max(0, min(r.x1,q.x1)-max(r.x0,q.x0))
            dy=max(0, min(r.y1,q.y1)-max(r.y0,q.y0))
            if dx > max(18, 0.18*min(r.width,q.width)) and dy > 0.24*min(r.height,q.height):
                hard_collisions.append((p,round(dx),round(dy),t[:32],u[:32]))
for p,dx,dy,t,u in hard_collisions:
    print("  p%02d  overlap=%d×%d 「%s」／「%s」" % (p,dx,dy,t,u))
print("  共 %d 处（须为 0）" % len(hard_collisions))
if hard_collisions:
    raise RuntimeError("检测到 %d 处文字行相撞，禁止导出投递版" % len(hard_collisions))
