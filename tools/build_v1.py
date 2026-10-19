# -*- coding: utf-8 -*-
"""导出 v1 投递版全本。

    pip3 install --target /tmp/pylibs pymupdf
    PYTHONPATH=/tmp/pylibs python3 tools/build_v1.py [输出路径]

不传输出路径时写到仓库根目录的 作品集-v1.pdf（该文件入库，联系方式应为占位）。
导出要发出去的投递版时传一个仓库外的路径，别把带联系方式的 PDF 提交上来。

顺序：封面 / 关于我 / 目录 ／ 案例一 控制中心 ／ 案例二 节日彩蛋 ／ 经历 GAS ／ 结尾
联系方式从仓库根目录的 contact.local.txt 读取（不入库）；缺文件时结尾页显示占位。
"""
import io, os, sys, tempfile
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import fitz

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def collect():
    import frontback, pages01, pages, pages04
    import lib
    lib.use_assets("case05")          # pages.py 用的是 case05
    return (frontback.FRONT + pages01.PAGES + pages.PAGES
            + pages04.PAGES + frontback.BACK)

def main():
    # pages01 会把 ASSETS 切到 case01，pages 需要 case05 —— 分别导入时各自设定
    import lib
    lib.use_assets("case01"); import pages01
    lib.use_assets("case05"); import pages
    import frontback, pages04
    svgs = frontback.FRONT + pages01.PAGES + pages.PAGES + pages04.PAGES + frontback.BACK

    n_case1 = len(pages01.PAGES)
    if n_case1 != frontback.N_CASE1:
        print(f"⚠️ 目录页按案例一 {frontback.N_CASE1} 页算，实际 {n_case1} 页 —— "
              f"改 tools/frontback.py 的 N_CASE1 后重导")

    d = tempfile.mkdtemp(); out = fitz.open()
    for i, svg in enumerate(svgs):
        f = os.path.join(d, "p%03d.svg" % i)
        io.open(f, "w", encoding="utf-8").write(svg)
        out.insert_pdf(fitz.open("pdf", fitz.open(f).convert_to_pdf()))
    out.subset_fonts()
    dst = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "作品集-v1.pdf")
    out.save(dst, garbage=4, deflate=True, clean=True)
    print("导出 %d 页 → %s" % (out.page_count, dst))
    if not os.path.exists(os.path.join(ROOT, "contact.local.txt")):
        print("⚠️ 没有 contact.local.txt，结尾页的联系方式是占位文字，别直接发出去")

if __name__ == "__main__":
    main()
