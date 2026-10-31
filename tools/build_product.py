# -*- coding: utf-8 -*-
"""导出非车企／通用产品 UX 岗精选版（28 页）。

    PYTHONPATH=/tmp/pylibs python3 tools/build_product.py [仓库外输出路径]

不论输出路径是否在仓库内，精选版均强制隐藏联系方式。
PDF 仍需在本地补上真实联系方式并复核后才能投递。
原 HMI 版仍由 tools/build.py 导出，不受影响。
"""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)


def _relabel_divider(svg, old_name, new_name, old_num, new_num):
    """只改案例扉页的编号；正文中的页内小节序号保持不变。"""
    for old, new in ((old_name, new_name), (old_num, new_num)):
        needle = ">" + old + "</text>"
        if svg.count(needle) != 1:
            raise ValueError("案例扉页找不到唯一的编号：" + needle)
        svg = svg.replace(needle, ">" + new + "</text>", 1)
    return svg


def collect():
    import lib

    lib.use_assets("case03")
    import pages03
    lib.use_assets("case01")
    import pages01
    lib.set_theme(None)
    import frontback_product as fb

    if len(pages03.PAGES) != fb.N_CASE_A or len(pages01.PAGES) != fb.N_CASE_B:
        raise ValueError("案例页数已变化，请同步检查 tools/frontback_product.py 的页码")

    import story_structure
    english = story_structure.english_pages(pages03.PAGES)
    control = story_structure.control_pages(pages01.PAGES)
    first = [_relabel_divider(english[0], "案例三", "案例一", "03", "01")]
    second = [_relabel_divider(control[0], "案例一", "案例二", "01", "02")]

    svgs = (fb.FRONT + first + english[1:]
            + second + control[1:] + fb.BACK)
    if len(svgs) != fb.N_TOTAL:
        raise ValueError("精选版页码异常：期望 %d，实际 %d" % (fb.N_TOTAL, len(svgs)))
    # Relabeling creates new strings; keep image geometry attached for QA.
    lib.BOXOF[id(first[0])] = lib.BOXOF.get(id(pages03.PAGES[0]), [])
    lib.BOXOF[id(second[0])] = lib.BOXOF.get(id(pages01.PAGES[0]), [])
    lib._keep.extend(first + second)
    return svgs


def main():
    if len(sys.argv) > 2:
        raise SystemExit("用法：python3 tools/build_product.py [输出路径]")
    if not os.environ.get("PORTFOLIO_FONT_DIR"):
        raise SystemExit("请先设置 PORTFOLIO_FONT_DIR，指向含静态 Noto Sans SC 字体的目录。")
    # Public-safe export, including explicit output paths.
    os.environ["PORTFOLIO_NO_CONTACT"] = "1"

    import fitz
    import render

    dst = (sys.argv[1] if len(sys.argv) == 2
           else os.path.join(ROOT, "作品集-产品交互-预览.pdf"))
    svgs = collect()
    render.to_pdf(svgs, dst)

    doc = fitz.open(dst)
    if doc.page_count != len(svgs):
        raise RuntimeError("导出页数不符")
    font_records = [f for page in doc for f in page.get_fonts(full=True)]
    fonts = sorted({f[3].split("+")[-1] for f in font_records if f[3]})
    bad = sorted({f[2] + ":" + (f[3] or "unnamed") for f in font_records
                  if f[2] == "Type3" or "Droid" in f[3] or f[3].startswith("Times")})
    doc.close()
    print("导出 %d 页 → %s" % (len(svgs), dst))
    print("· 字体：" + ("、".join(fonts) if fonts else "（无字体名）"))
    if bad:
        raise RuntimeError("字体不适合投递：%s。请设置 PORTFOLIO_FONT_DIR 指向静态 Noto Sans SC 字体目录后重导。" % "、".join(bad[:3]))
    print("· 对外版：联系方式为占位；投递前请在本地补上真实联系信息。")


if __name__ == "__main__":
    main()
