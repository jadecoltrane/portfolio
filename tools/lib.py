# -*- coding: utf-8 -*-
import io, re, os
W,H = 1600, 900
# 仓库根目录下的 assets/，不再写死某台机器的绝对路径
_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(_ROOT, "assets", "case05")

def use_assets(sub):
    """切换配图目录并切到该案例的主题色，例如 use_assets("case01")"""
    global ASSETS
    ASSETS = os.path.join(_ROOT, "assets", sub)
    THEME[0] = CASE_THEME.get(sub)

def contact():
    """联系方式从未入库的本地文件读取（见 .gitignore）。
    格式：每行 `标签: 值`，例如 `邮箱: x@y.com`。文件不存在时返回占位。"""
    f = os.path.join(_ROOT, "contact.local.txt")
    # 导出入库副本时强制占位，避免真实联系方式被提交（build_v1.py 会设这个环境变量）
    if os.environ.get("PORTFOLIO_NO_CONTACT") == "1" or not os.path.exists(f):
        return [("邮箱", "（导出投递版前填入 contact.local.txt）"),
                ("手机", "（同上）")]
    out=[]
    for line in io.open(f, encoding="utf-8"):
        line=line.strip()
        if not line or line.startswith("#"): continue
        if ":" in line or "：" in line:
            k,v=re.split(r"[:：]", line, 1)
            out.append((k.strip(), v.strip()))
    return out
FF = "PingFang SC, Noto Sans CJK SC, Heiti SC, Microsoft YaHei, sans-serif"
C = dict(ink="#1f2937", ink2="#374151", mute="#6b7280", faint="#9ca3af",
         line="#e5e7eb", wash="#f9fafb", acc="#2563eb", accw="#dbeafe",
         danger="#dc2626", dangerw="#fee2e2", warn="#b45309", warnw="#fffbeb",
         indigo="#4338ca", indigow="#eef2ff",
         teal="#0d9488", violet="#7c3aed")

# 每个案例一个主题色：扉页整条、案例内页左上角一小条，翻着就能分出来。
# 红色永远只给安全语义，不做主题色。
THEME = [None]
CASE_THEME = {"case01": C["acc"], "case05": C["teal"], "case03": C["violet"]}

def set_theme(color):
    THEME[0] = color

def esc(t):
    return t.replace("&","&amp;").replace("<","&lt;").replace(">","&gt;")

def T(x,y,t,size=16,fill=None,weight=400,anchor="start",ls=None,op=None):
    a=[f'x="{x}"',f'y="{y}"',f'font-size="{size}"',f'fill="{fill or C["ink"]}"']
    if weight!=400: a.append(f'font-weight="{weight}"')
    if anchor!="start": a.append(f'text-anchor="{anchor}"')
    if ls: a.append(f'letter-spacing="{ls}"')
    if op: a.append(f'opacity="{op}"')
    return f'<text {" ".join(a)}>{esc(t)}</text>'

def TL(x,y,lines,size=16,lh=1.6,**kw):
    out=[]
    for i,l in enumerate(lines):
        if l: out.append(T(x, y+int(i*size*lh), l, size=size, **kw))
    return "\n".join(out)

def R(x,y,w,h,fill="none",stroke=None,rx=0,sw=1,dash=None):
    a=[f'x="{x}"',f'y="{y}"',f'width="{w}"',f'height="{h}"',f'fill="{fill}"']
    if rx: a.append(f'rx="{rx}"')
    if stroke: a.append(f'stroke="{stroke}"'); a.append(f'stroke-width="{sw}"')
    if dash: a.append(f'stroke-dasharray="{dash}"')
    return f'<rect {" ".join(a)}/>'

def LN(x1,y1,x2,y2,stroke=None,sw=1):
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{stroke or C["line"]}" stroke-width="{sw}"/>'

_fign=[0]
_pending_boxes=[]      # fig()/img() 落位，page() 取走
FIGBOXES=[]            # 每页一项：该页所有图的 (x,y,w,h,name)
BOXOF={}               # id(svg) -> 该页图框；_keep 防止 id 被回收复用
_keep=[]
def fig(name,x,y,w,h):
    """把已有配图 SVG 以 <g transform> 方式贴入；类名加前缀避免同页冲突"""
    _fign[0]+=1
    pre="f%d_"%_fign[0]
    s=io.open(os.path.join(ASSETS,name),encoding="utf-8").read()
    s=re.sub(r'<\?xml[^>]*\?>','',s).strip()
    m=re.match(r'<svg([^>]*)>', s, re.S)
    attrs=m.group(1)
    vw,vh=[float(v) for v in re.search(r'viewBox="([^"]+)"',attrs).group(1).split()[2:4]]
    body=s[m.end():]
    body=body[:body.rfind('</svg>')]
    # 收集类名并加前缀（样式表选择器 + class 属性）
    names=set(re.findall(r'\.([A-Za-z_][\w-]*)\s*\{', body))
    for n in sorted(names,key=len,reverse=True):
        body=re.sub(r'\.'+n+r'(\s*[,{])', '.'+pre+n+r'\1', body)
    def _cls(mm):
        return 'class="'+" ".join(pre+c if c in names else c for c in mm.group(1).split())+'"'
    body=re.sub(r'class="([^"]*)"', _cls, body)
    # id/引用（marker 等）同样加前缀，避免同页冲突
    ids=set(re.findall(r'\bid="([^"]+)"', body))
    for i in sorted(ids,key=len,reverse=True):
        body=body.replace('id="%s"'%i, 'id="%s%s"'%(pre,i))
        body=body.replace('url(#%s)'%i, 'url(#%s%s)'%(pre,i))
    sc=min(w/vw, h/vh)
    ox=x+(w-vw*sc)/2.0
    oy=y+(h-vh*sc)/2.0
    _pending_boxes.append((ox, oy, vw*sc, vh*sc, name))
    if os.environ.get("PORTFOLIO_FIG_STUB") == "1":
        return R(ox, oy, vw*sc, vh*sc, fill="#eef2ff")
    return ('<g transform="translate(%.2f,%.2f) scale(%.4f)" font-family="%s">%s</g>'
            % (ox,oy,sc,FF,body))

def img(relpath, x, y, w, h, rx=8, border=True):
    """把位图（截图）以 base64 嵌进 SVG。按 w/h 等比缩放居中，整图不裁。
    relpath 相对 ASSETS。"""
    import base64, mimetypes
    f = os.path.join(ASSETS, relpath)
    mt = mimetypes.guess_type(f)[0] or "image/jpeg"
    b64 = base64.b64encode(io.open(f, "rb").read()).decode()
    try:
        from PIL import Image
        iw, ih = Image.open(f).size
    except Exception:
        iw, ih = w, h
    sc = min(w / float(iw), h / float(ih))
    dw, dh = iw * sc, ih * sc
    ox, oy = x + (w - dw) / 2.0, y + (h - dh) / 2.0
    _pending_boxes.append((ox, oy, dw, dh, relpath))
    if os.environ.get("PORTFOLIO_FIG_STUB") == "1":
        return R(ox, oy, dw, dh, fill="#eef2ff")
    out = ''
    if border:
        out += R(ox - 1, oy - 1, dw + 2, dh + 2, fill="none", stroke=C["line"], rx=rx + 1)
    out += ('<image x="%.2f" y="%.2f" width="%.2f" height="%.2f" '
            'preserveAspectRatio="xMidYMid meet" href="data:%s;base64,%s"/>'
            % (ox, oy, dw, dh, mt, b64))
    return out

def page(content, bg="#ffffff"):
    global _pending_boxes
    mine = _pending_boxes; _pending_boxes = []
    FIGBOXES.append(mine)
    tab = (R(0, 0, 220, 8, fill=THEME[0])
           if THEME[0] and bg == "#ffffff" else "")
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" '
           f'width="{W}" height="{H}" font-family="{FF}">'
           f'<rect width="{W}" height="{H}" fill="{bg}"/>{tab}{content}</svg>')
    BOXOF[id(svg)] = mine        # 版面自检用：这一页上所有图的落位
    _keep.append(svg)
    return svg

def eyebrow(t): return T(96, 88, t, size=17, fill=C["faint"], weight=600, ls="3")
def h1(lines, y=170, size=52): return TL(96, y, lines, size=size, lh=1.34, weight=700, fill=C["ink"])
def body(lines, y, size=23, fill=None): return TL(96, y, lines, size=size, lh=1.68, fill=fill or C["ink2"])


# ══ 案例扉页 ══
# 翻到深色这一页就知道换案例了。全书只有这三页是深底，别处不要再用。
DARK   = "#1f2937"
_D_NUM = "#2e3a4b"   # 底纹大数字：比底色亮一档，远看是肌理，近看才认得出
_D_SUB = "#cbd5e1"
_D_DIM = "#94a3b8"

def divider(no, big, title, sub, pages_label):
    """案例扉页：序号 + 案例名 + 一句主张 + 交付口径。顶条用该案例的主题色。"""
    return page("".join([
        R(0, 0, W, 8, fill=THEME[0] or C["acc"]),
        T(W - 120, 700, big, size=300, fill=THEME[0] or _D_NUM, weight=700,
          anchor="end", op="0.3"),
        T(120, 170, no, size=20, fill=_D_DIM, weight=600, ls="6"),
        TL(120, 350, title, size=66, lh=1.28, weight=700, fill="#ffffff"),
        TL(120, 520, sub, size=25, lh=1.7, fill=_D_SUB),
        LN(120, 768, W - 120, 768, stroke="#3f4a5a"),
        T(120, 808, pages_label, size=17, fill=_D_DIM),
    ]), bg=DARK)
