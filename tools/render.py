# -*- coding: utf-8 -*-
"""把一串页面 SVG 渲成 PDF。

为什么不用 PyMuPDF 直接转：MuPDF 的 SVG 设备不走系统字体，中文一律落到它自带的
Droid Sans Fallback，拉丁字和数字落到 base-14 的 Times 衬线体——导出来的书里
中文是一套灰度、英文数字是另一套，而且根本不是规范里写的 PingFang。
Chromium 走 fontconfig，字体栈里装了哪个就用哪个，所以导出走它。
Chromium 不在时退回 PyMuPDF，并在输出里说明降级了。
"""
import glob, io, os, shutil, subprocess, tempfile

W, H = 1600, 900
_CANDIDATES = ["chromium", "chromium-browser", "google-chrome", "chrome"]

def chromium():
    for c in _CANDIDATES:
        p = shutil.which(c)
        if p: return p
    for pat in ("/opt/pw-browsers/chromium-*/chrome-linux/chrome",
                "/opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell"):
        g = sorted(glob.glob(pat))
        if g: return g[-1]
    return None

_HTML = """<!doctype html><meta charset="utf-8"><style>
@page {{ size: {w}px {h}px; margin: 0; }}
html, body {{ margin: 0; padding: 0; background: #fff; }}
.pg {{ width: {w}px; height: {h}px; overflow: hidden; break-after: page; }}
.pg:last-child {{ break-after: auto; }}
svg {{ display: block; }}
</style>{body}"""

def to_pdf(svgs, dst):
    """渲染并写到 dst。返回 (页宽 ÷ 1600)，自检脚本靠它换算坐标。"""
    exe = chromium()
    if exe:
        tmp = tempfile.mkdtemp()
        html = os.path.join(tmp, "book.html")
        body = "".join('<div class="pg">%s</div>' % s for s in svgs)
        io.open(html, "w", encoding="utf-8").write(_HTML.format(w=W, h=H, body=body))
        out = os.path.join(tmp, "book.pdf")
        subprocess.run([exe, "--headless", "--disable-gpu", "--no-sandbox",
                        "--no-pdf-header-footer", "--print-to-pdf=" + out,
                        "file://" + html],
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        import fitz
        d = fitz.open(out)
        if d.page_count != len(svgs):
            raise RuntimeError("Chromium 导出 %d 页，应为 %d 页" % (d.page_count, len(svgs)))
        scale = d[0].rect.width / W
        # 不要再 subset_fonts()：Chromium 自己已经子集化了，再来一次会被转成
        # Type3（一个字一个字体），文件胀大、部分阅读器显示发虚。
        d.save(dst, garbage=4, deflate=True, clean=True)
        d.close()
        return scale

    # 退路：MuPDF 自己转。字体会变，只能用来看版面，不能当投递版。
    print("⚠️ 没找到 Chromium，退回 MuPDF 渲染 —— 字体会落到 Droid Sans + Times，别拿这份投。")
    import fitz
    tmp = tempfile.mkdtemp(); doc = fitz.open()
    for i, svg in enumerate(svgs):
        f = os.path.join(tmp, "p%03d.svg" % i)
        io.open(f, "w", encoding="utf-8").write(svg)
        doc.insert_pdf(fitz.open("pdf", fitz.open(f).convert_to_pdf()))
    doc.subset_fonts()
    doc.save(dst, garbage=4, deflate=True, clean=True)
    doc.close()
    return 1.0
