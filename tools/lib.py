# -*- coding: utf-8 -*-
import io, re, os
W,H = 1600, 900
ASSETS = "/Users/peiyaohuang/Desktop/portfolio/assets/case05"
FF = "PingFang SC, Noto Sans CJK SC, Heiti SC, Microsoft YaHei, sans-serif"
C = dict(ink="#1f2937", ink2="#374151", mute="#6b7280", faint="#9ca3af",
         line="#e5e7eb", wash="#f9fafb", acc="#2563eb", accw="#dbeafe",
         danger="#dc2626", dangerw="#fee2e2", warn="#b45309", warnw="#fffbeb",
         indigo="#4338ca", indigow="#eef2ff")

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
    return ('<g transform="translate(%.2f,%.2f) scale(%.4f)" font-family="%s">%s</g>'
            % (ox,oy,sc,FF,body))

def page(content):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" '
            f'width="{W}" height="{H}" font-family="{FF}">'
            f'<rect width="{W}" height="{H}" fill="#ffffff"/>{content}</svg>')

def eyebrow(t): return T(96, 88, t, size=17, fill=C["faint"], weight=600, ls="3")
def h1(lines, y=170, size=52): return TL(96, y, lines, size=size, lh=1.34, weight=700, fill=C["ink"])
def body(lines, y, size=23, fill=None): return TL(96, y, lines, size=size, lh=1.68, fill=fill or C["ink2"])
