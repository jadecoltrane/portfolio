# -*- coding: utf-8 -*-
"""版面自检。三件事：图有没有盖住字、字有没有出版心、每页内容量差多少。

    PYTHONPATH=/tmp/pylibs python3 tools/自检.py

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

lib.use_assets("case01"); import pages01
lib.use_assets("case05"); import pages
lib.use_assets("case03"); import pages03
lib.set_theme(None)   # 前后页与经历页不属于任何案例
import frontback, pages04
ORDER = (frontback.FRONT + pages01.PAGES + pages.PAGES + pages03.PAGES
         + pages04.PAGES + frontback.BACK)

tmp = tempfile.mkdtemp(); doc = fitz.open()
for i, svg in enumerate(ORDER):
    f = os.path.join(tmp, "p%03d.svg" % i)
    io.open(f, "w", encoding="utf-8").write(svg)
    doc.insert_pdf(fitz.open("pdf", fitz.open(f).convert_to_pdf()))

def spans(pg):
    for b in pg.get_text("dict")["blocks"]:
        if b["type"] != 0: continue
        for l in b["lines"]:
            for s in l["spans"]:
                if s["text"].strip():
                    yield fitz.Rect(s["bbox"]), s["text"].strip(), s["size"]

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
