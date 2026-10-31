# -*- coding: utf-8 -*-
"""Rebuild the two portfolios with eight annotated illustration inserts.

Requires approved composite illustration JPG files in
assets/portfolio_illustrations/composite/{h1,h2,h3,h4,h5,u6,u7,u8}.jpg.
They are not the unlabelled image-generation originals. The existing 38/28
page exporters are not modified by this script.
"""
import argparse, os, subprocess, sys
from pathlib import Path
import fitz

ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = ROOT / "assets" / "portfolio_illustrations" / "composite"
SPECS = {
    "hmi": {
        "source": "tools/build.py", "stem": "car-ux", "base": 38, "final": 46,
        "insert": {6:["h1"],9:["h2"],13:["h3"],20:["h5"],23:["h4"],
                   26:["u6"],28:["u7"],33:["u8"]},
        "toc": [("4–14","4-17"),("15–23","18-28"),("24–36","29-44"),("37","45")],
        "cover": ("38 PAGES","46 PAGES"),
    },
    "product": {
        "source": "tools/build_product.py", "stem": "product-ux", "base": 28,
        "final": 34,
        "insert": {6:["u6"],8:["u7"],13:["u8"],19:["h1"],22:["h2"],26:["h3"]},
        "toc": [("4–16","4-19"),("17–27","20-33")],
        "cover": ("28 PAGES","34 PAGES"),
    },
}

def required_assets(variants):
    codes = {c for name in variants for a in SPECS[name]["insert"].values() for c in a}
    missing = [str(ASSET_DIR / (c+".jpg")) for c in sorted(codes)
               if not (ASSET_DIR / (c+".jpg")).is_file()]
    if missing:
        raise SystemExit("Missing approved illustration composites:\n  " +
                         "\n  ".join(missing) +
                         "\nDo not use unlabelled generated originals as replacements.")

def replace_reference(page, old, new, cover=False):
    matches=page.search_for(old)
    if len(matches)!=1:
        raise RuntimeError("Expected exactly one text reference %r, got %d" %
                           (old,len(matches)))
    rect=matches[0]
    patch=fitz.Rect(rect.x0-2,rect.y0-2,rect.x1+7,rect.y1+3)
    bg=(16/255,26/255,42/255) if cover else (1,1,1)
    fg=(166/255,187/255,215/255) if cover else (.14,.19,.29)
    page.add_redact_annot(patch,fill=bg)
    page.apply_redactions(images=0,graphics=0,text=0)
    page.insert_text((rect.x0,rect.y1-3),new,fontname="hebo",
                     fontsize=18 if cover else 16,color=fg,overlay=True)

def build(name, outdir):
    spec=SPECS[name]
    source=outdir/(spec["stem"]+"-base.pdf")
    target=outdir/(spec["stem"]+"-illustrated.pdf")
    env=dict(os.environ,PORTFOLIO_NO_CONTACT="1")
    subprocess.run([sys.executable,str(ROOT/spec["source"]),str(source)],
                   check=True,cwd=ROOT,env=env)
    src=fitz.open(source)
    if len(src)!=spec["base"]:
        raise RuntimeError("Unexpected input page count")
    dst=fitz.open()
    for i in range(len(src)):
        dst.insert_pdf(src,from_page=i,to_page=i)
        for c in spec["insert"].get(i+1,[]):
            page=dst.new_page(width=src[0].rect.width,height=src[0].rect.height)
            page.insert_image(page.rect,filename=str(ASSET_DIR/(c+".jpg")),
                              keep_proportion=False)
    for old,new in spec["toc"]:
        replace_reference(dst[2],old,new)
    replace_reference(dst[0],*spec["cover"],cover=True)
    if len(dst)!=spec["final"]: raise RuntimeError("Unexpected final page count")
    dst.set_metadata({**src.metadata,
                      "title":("车机 UX" if name=="hmi" else "普通 UX")+" 配图整合版"})
    dst.save(target,garbage=4,deflate=True)
    print("Exported",target,"pages=",len(dst),
          "MB=",round(target.stat().st_size/1024/1024,2))
    dst.close(); src.close()

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--variant",choices=("hmi","product","both"),default="both")
    parser.add_argument("--output-dir",default=str(ROOT/"dist"))
    args=parser.parse_args()
    variants=("hmi","product") if args.variant=="both" else (args.variant,)
    required_assets(variants)
    outdir=Path(args.output_dir).expanduser().resolve()
    outdir.mkdir(parents=True,exist_ok=True)
    for name in variants: build(name,outdir)

if __name__=="__main__":
    main()
