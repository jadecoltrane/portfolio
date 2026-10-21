#!/usr/bin/env bash
# 在导出机器上装中文字体。
#
# 为什么要这一步：导出走 Chromium，Chromium 走 fontconfig。机器上一个中文字体都没有时，
# 中文会落到兜底的 Droid Sans Fallback、英文和数字落到 Times 衬线体——中文一套灰度、
# 英文一套，而且根本不是规范里写的 PingFang。jade 自己的 Mac 上有 PingFang，不用跑这个。
#
# 为什么是静态 TTF：Chromium 嵌不进可变字体，也嵌不进 OTF（CFF 轮廓），
# 两种都会退成 Type3——一个字一个字体，文件胀到四倍，有的阅读器还显示发虚。
# 所以先下可变字体，再用 fonttools 切出 Regular / Medium / Bold 三个静态实例。
set -euo pipefail
DEST=${1:-/usr/local/share/fonts/noto}
LIBS=${PYLIBS:-/tmp/pylibs}
TMP=$(mktemp -d)

curl -sSL -o "$TMP/NotoSansSC.ttf" \
  "https://raw.githubusercontent.com/google/fonts/main/ofl/notosanssc/NotoSansSC%5Bwght%5D.ttf"
pip3 install --quiet --target "$LIBS" fonttools brotli

PYTHONPATH="$LIBS" python3 - "$TMP" <<'PY'
import sys
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
d = sys.argv[1]
for wght, name in ((400, "Regular"), (500, "Medium"), (700, "Bold")):
    f = TTFont(f"{d}/NotoSansSC.ttf")
    instancer.instantiateVariableFont(f, {"wght": wght}, inplace=True, updateFontNames=True)
    f.save(f"{d}/NotoSansSC-{name}.ttf")
    print("  切出", name)
PY

mkdir -p "$DEST"
cp "$TMP"/NotoSansSC-{Regular,Medium,Bold}.ttf "$DEST"/
fc-cache -f >/dev/null
echo "装好了："
fc-list :lang=zh family | grep -i "noto sans sc" | sort -u
echo "导出后 tools/build.py 会打印嵌进 PDF 的字体，看到 NotoSansSC 就对了。"
