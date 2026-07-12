// ── Cursor elements (injected on every page) ─────────────────────────────────
(function() {
  if (!document.getElementById('cursorDot')) {
    const d = document.createElement('div');
    d.id = 'cursorDot'; d.className = 'cursor-dot';
    document.body.appendChild(d);
  }
  if (!document.getElementById('cursorRing')) {
    const r = document.createElement('div');
    r.id = 'cursorRing'; r.className = 'cursor-ring';
    document.body.appendChild(r);
  }
})();

// ── Clock ─────────────────────────────────────────────────────────────────────
function updateClock() {
  const t = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }));
  const pad = n => String(n).padStart(2, '0');
  const el = document.getElementById('clock');
  if (el) el.textContent = `${pad(t.getHours())}:${pad(t.getMinutes())}:${pad(t.getSeconds())}`;
}
setInterval(updateClock, 1000);
updateClock();

// ── Language toggle ───────────────────────────────────────────────────────────
document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const lang = btn.dataset.l;
    document.body.dataset.lang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.l === lang));
    document.querySelectorAll('[data-zh]').forEach(el => {
      if (el.dataset[lang]) el.innerHTML = el.dataset[lang];
    });
  });
});


// ── Hero: static cutout flower + flowing blue/cream gradient behind it ────────
function initHeroFlow() {
  const hero = document.querySelector('.card-hero');
  if (!hero) return;

  // Photo stays as a CSS fallback (and for non-WebGL browsers)
  hero.style.backgroundImage = "url('hero-flower.jpg')";
  hero.style.backgroundSize = 'cover';
  hero.style.backgroundPosition = 'center 30%';
  hero.style.backgroundRepeat = 'no-repeat';

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border-radius:inherit;pointer-events:none;z-index:0;';
  hero.insertBefore(canvas, hero.firstChild);

  const gl = canvas.getContext('webgl', { alpha: true });
  if (!gl) { canvas.remove(); return; }

  hero.classList.add('webgl-active');

  function resize() {
    const dpr = Math.min(devicePixelRatio, 2);
    canvas.width  = hero.offsetWidth  * dpr;
    canvas.height = hero.offsetHeight * dpr;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resize();
  new ResizeObserver(resize).observe(hero);

  function compileShader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    return s;
  }

  const vert = `
    attribute vec2 a_pos;
    varying vec2 v_uv;
    void main() {
      gl_Position = vec4(a_pos, 0.0, 1.0);
      v_uv = vec2(a_pos.x * 0.5 + 0.5, 1.0 - (a_pos.y * 0.5 + 0.5));
    }
  `;

  const frag = `
    precision highp float;
    varying vec2 v_uv;
    uniform sampler2D u_tex;
    uniform vec2  u_res;
    uniform vec2  u_img;
    uniform float u_time;

    float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
    float vnoise(vec2 p){
      vec2 i = floor(p), f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i + vec2(0.0,0.0)), hash(i + vec2(1.0,0.0)), u.x),
                 mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x), u.y);
    }
    float fbm(vec2 p){
      float v = 0.0, a = 0.5;
      for (int k = 0; k < 5; k++){ v += a * vnoise(p); p *= 2.0; a *= 0.5; }
      return v;
    }

    void main() {
      // Screen pixel → photo uv (mirrors background-size:cover + position:center 30%)
      float s = max(u_res.x / u_img.x, u_res.y / u_img.y);
      vec2 off = vec2((u_res.x - u_img.x * s) * 0.5, (u_res.y - u_img.y * s) * 0.30);
      vec2 uv = ((v_uv * u_res - off) / s) / u_img;
      vec4 photo = texture2D(u_tex, clamp(uv, 0.0, 1.0));

      // ── Flow field (light moving across the background) ──
      // The photo's blue background is smooth, so warping it shows no motion.
      // Instead we keep each pixel's ORIGINAL colour and run a flowing band of
      // light/shadow (in the photo's own tones) across it — clearly animated.
      vec2 p = v_uv - 0.5;
      p.x *= u_res.x / u_res.y;
      float t = u_time * 0.28;
      vec2 flow = vec2(t, t * 0.6);
      vec2 w = vec2(fbm(p * 1.4 + flow), fbm(p * 1.4 + flow + 7.3));
      float nf = fbm(p * 1.8 + w * 1.1);
      // a travelling wave guarantees the light visibly sweeps across the blue
      float wave = 0.5 + 0.5 * sin((p.x * 2.2 + p.y * 1.4) * 3.1 - t * 2.0 + (w.x - 0.5) * 4.0);
      float n = mix(nf, wave, 0.5);

      // Light/shadow derived from the local original colour → stays true to the photo
      vec3 base = photo.rgb;
      vec3 hi   = mix(base, vec3(0.937, 0.910, 0.835), 0.50);  // toward the photo's cream glow
      vec3 lo   = base * 0.82;                                  // gentle shadow
      vec3 flowCol = mix(lo, hi, smoothstep(0.32, 0.74, n));

      // ── Composite: lace flower stays static, blue background flows ──
      // Cyanotype blue is desaturated, so (b - r) separates background blue
      // from the cream/lace flower far better than (b - max(r,g)).
      // Flower lace (cream / warm) → low b-r → keep photo (static).
      // Smooth blue background → high b-r → flowing light shows through.
      float blueLead = photo.b - photo.r;
      float bg = smoothstep(0.06, 0.12, blueLead);
      vec3 col = mix(base, flowCol, bg);

      // Readability darkening (top + bottom)
      vec3 navy = vec3(0.031, 0.059, 0.110);
      float dark = mix(0.28, 0.0, smoothstep(0.0, 0.55, v_uv.y));
      dark += smoothstep(0.62, 1.0, v_uv.y) * 0.22;
      col = mix(col, navy, dark);

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  const prog = gl.createProgram();
  gl.attachShader(prog, compileShader(gl.VERTEX_SHADER, vert));
  gl.attachShader(prog, compileShader(gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(prog); gl.useProgram(prog);

  const quad = new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uTex  = gl.getUniformLocation(prog, 'u_tex');
  const uRes  = gl.getUniformLocation(prog, 'u_res');
  const uImg  = gl.getUniformLocation(prog, 'u_img');
  const uTime = gl.getUniformLocation(prog, 'u_time');

  const img = new Image();
  img.onload = () => {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

    const start = Date.now();
    function tick() {
      gl.useProgram(prog);
      gl.uniform1i(uTex, 0);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform2f(uImg, img.width, img.height);
      gl.uniform1f(uTime, (Date.now() - start) * 0.001);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      requestAnimationFrame(tick);
    }
    tick();
  };
  img.src = 'hero-flower.jpg';
}
initHeroFlow();

// ── B: Magnetic connect button ───────────────────────────────────────────────
const btn = document.querySelector('.hero-connect');
if (btn) {
  btn.addEventListener('mousemove', e => {
    const r = btn.getBoundingClientRect();
    btn.style.transform = `translate(${(e.clientX - r.left - r.width/2) * 0.3}px, ${(e.clientY - r.top - r.height/2) * 0.3}px)`;
    btn.style.transition = 'transform 0.1s ease';
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'translate(0,0)';
    btn.style.transition = 'transform 0.7s cubic-bezier(0.23,1,0.32,1)';
  });
}

// ── C: Text scramble on name → subtitle fades in after ───────────────────────
class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = '璣琴花月星云露霜玲珑瑞瑜琦瑰瑶';
    this.update = this.update.bind(this);
  }
  setText(text) {
    this.queue = text.split('').map((to, i) => ({ to, start: i * 5, end: i * 5 + 12 + Math.floor(Math.random() * 8) }));
    this.frame = 0;
    cancelAnimationFrame(this.raf);
    return new Promise(res => { this.resolve = res; this.update(); });
  }
  rnd() { return this.chars[Math.floor(Math.random() * this.chars.length)]; }
  update() {
    let out = '', done = 0;
    for (const q of this.queue) {
      if (this.frame >= q.end) { done++; out += q.to; }
      else if (this.frame >= q.start) { if (!q.c || Math.random() < 0.3) q.c = this.rnd(); out += `<span style="opacity:0.3">${q.c}</span>`; }
      else { out += `<span style="opacity:0">${q.to}</span>`; }
    }
    this.el.innerHTML = out;
    if (done < this.queue.length) { this.raf = requestAnimationFrame(this.update); this.frame++; }
    else { this.resolve(); }
  }
}

const cnEl = document.querySelector('.name-cn');
const subtitleEl = document.querySelector('.hero-subtitle');

if (cnEl) {
  const name = cnEl.textContent;
  cnEl.innerHTML = name.split('').map(() => '<span style="opacity:0">_</span>').join('');
  setTimeout(() => {
    new TextScramble(cnEl).setText(name).then(() => {
      if (subtitleEl) subtitleEl.classList.add('revealed');
    });
  }, 500);
}

// ── D: Hero card clickable ────────────────────────────────────────────────────
const heroCard = document.getElementById('heroCard');
if (heroCard) {
  heroCard.addEventListener('click', e => {
    if (e.target.closest('.hero-connect')) return;
    window.location.href = 'resume.html';
  });
}

// ── E: Spotlight ─────────────────────────────────────────────────────────────
const hero = document.querySelector('.card-hero');
if (hero) {
  hero.addEventListener('mousemove', e => {
    const r = hero.getBoundingClientRect();
    hero.style.setProperty('--mx', `${e.clientX - r.left}px`);
    hero.style.setProperty('--my', `${e.clientY - r.top}px`);
  });
}

// ── Custom cursor ─────────────────────────────────────────────────────────────
const dot  = document.getElementById('cursorDot');
const ring = document.getElementById('cursorRing');

let mx = -100, my = -100, rx = -100, ry = -100;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  document.body.classList.add('cursor-active');
  if (dot) { dot.style.left = mx + 'px'; dot.style.top = my + 'px'; }
});

document.addEventListener('mouseleave', () => {
  document.body.classList.remove('cursor-active');
});

function mainLoop() {
  if (ring) {
    rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
  }
  requestAnimationFrame(mainLoop);
}
mainLoop();

document.querySelectorAll('.card-project, .card-resume, .card-photo').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-on-card'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-on-card'));
});
if (hero) {
  hero.addEventListener('mouseenter', () => document.body.classList.add('cursor-on-hero'));
  hero.addEventListener('mouseleave', () => document.body.classList.remove('cursor-on-hero'));
}
document.querySelectorAll('a, button, .lang-btn').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-on-link'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-on-link'));
});

// ── Mini control center (bento-right widget) ─────────────────────────────────
(function () {
  const root = document.documentElement;
  const ACCENTS = ['', 'teal', 'violet'];

  const dark = document.getElementById('ctrlDark');
  function syncDark() {
    const on = root.getAttribute('data-theme') === 'dark';
    if (dark) { dark.classList.toggle('ctrl-row--on', on); dark.setAttribute('aria-pressed', String(on)); }
  }
  if (dark) {
    dark.addEventListener('click', () => {
      const on = root.getAttribute('data-theme') === 'dark';
      if (on) { root.removeAttribute('data-theme'); try { localStorage.removeItem('jcTheme'); } catch (e) {} }
      else { root.setAttribute('data-theme', 'dark'); try { localStorage.setItem('jcTheme', 'dark'); } catch (e) {} }
      syncDark();
    });
    syncDark();
  }

  const amb = document.getElementById('ctrlAmbient');
  function syncAmb() {
    const cur = root.getAttribute('data-accent') || '';
    if (!amb) return;
    amb.classList.toggle('ctrl-row--on', cur !== '');
    amb.querySelectorAll('.ctrl-dot').forEach(d =>
      d.classList.toggle('ctrl-dot--active', (d.dataset.accent || '') === cur));
  }
  if (amb) {
    amb.addEventListener('click', () => {
      const cur = root.getAttribute('data-accent') || '';
      const next = ACCENTS[(ACCENTS.indexOf(cur) + 1) % ACCENTS.length];
      if (next) { root.setAttribute('data-accent', next); try { localStorage.setItem('jcAccent', next); } catch (e) {} }
      else { root.removeAttribute('data-accent'); try { localStorage.removeItem('jcAccent'); } catch (e) {} }
      syncAmb();
    });
    syncAmb();
  }
})();
