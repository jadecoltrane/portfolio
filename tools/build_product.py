# -*- coding: utf-8 -*-
"""导出非车企／通用产品 UX 岗精选版（28 页）。

    PYTHONPATH=/tmp/pylibs python3 tools/build_product.py [仓库外输出路径]

无输出路径时，生成仓库内预览文件并强制隐藏联系方式。
真实联系方式只从不入库的 contact.local.txt 读取；不要把带联系方式的 PDF 提交。
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

    first = [_relabel_divider(pages03.PAGES[0], "案例三", "案例一", "03", "01")]
    second = [_relabel_divider(pages01.PAGES[0], "案例一", "案例二", "01", "02")]

    svgs = (fb.FRONT + first + pages03.PAGES[1:]
            + second + pages01.PAGES[1:] + fb.BACK)
    if len(svgs) != fb.N_TOTAL:
        raise ValueError("精选版页码异常：期望 %d，实际 %d" % (fb.N_TOTAL, len(svgs)))
    return svgs


def main():
    if len(sys.argv) > 2:
        raise SystemExit("用法：python3 tools/build_product.py [输出路径]")
    if len(sys.argv) == 1:
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
    fonts = sorted({f[3].split("+")[-1] for page in doc for f in page.get_fonts(full=True)})
    doc.close()
    bad = [f for f in fonts if "Droid" in f or f.startswith("Times")]
    print("导出 %d 页 → %s" % (len(svgs), dst))
    print("· 字体：" + ("、".join(fonts) if fonts else "（无字体名）"))
    if bad:
        print("⚠️ 字体回退为 %s，不可直接投递；请装 Noto Sans SC 再导。" % "、".join(bad))
    if os.environ.get("PORTFOLIO_NO_CONTACT") == "1":
        print("· 预览版：联系方式已强制隐藏。")
    elif not os.path.isfile(os.path.join(ROOT, "contact.local.txt")):
        print("⚠️ 未找到 contact.local.txt，联系方式仍为占位，别直接投递。")


if __name__ == "__main__":
    main()
