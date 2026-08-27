# PDF 生成脚本

案例⑤ 的 6 页 PDF 由这两个脚本生成，配图直接引用 `assets/case05/` 里的 SVG，
改图或改文案后重跑即可，不需要手动重排。

```bash
pip3 install --target /tmp/pylibs pymupdf
PYTHONPATH=/tmp/pylibs:tools python3 - <<'PY'
import io,sys,fitz; sys.path.insert(0,'tools')
from pages import PAGES
out=fitz.open()
for i,svg in enumerate(PAGES):
    io.open(f"/tmp/p{i+1}.svg","w",encoding="utf-8").write(svg)
    out.insert_pdf(fitz.open("pdf", fitz.open(f"/tmp/p{i+1}.svg").convert_to_pdf()))
out.subset_fonts()
out.save("案例5-节日彩蛋.pdf", garbage=4, deflate=True, clean=True)
PY
```

- `lib.py` —— 版式基元（字号、颜色、文本、配图嵌入）。颜色与字号取自 [排版规范.md](../排版规范.md)
- `pages.py` —— 6 页的实际内容，改文案改这里
- 页面尺寸 1600×900（16:9），字体 PingFang SC
- **导出后必须 `subset_fonts()` + `garbage=4, deflate=True`**：不做这一步每页会各嵌一份完整中文字体，11 MB；做完 140 KB

**配图嵌入的两个坑**（已在 `lib.fig()` 里处理，别改回去）：
1. MuPDF 不认嵌套 `<svg>` 的 y 坐标，必须用 `<g transform="translate() scale()">`
2. 同一页放多张图时，各图的 CSS 类名与 `id`（marker 等）会互相覆盖，需要加前缀隔离
