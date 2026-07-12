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


// ── Hero: interactive dark flow field (touch/cursor ripples) ─────────────────
function initHeroFlow() {
  const hero = document.querySelector('.card-hero');
  if (!hero) return;

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border-radius:inherit;pointer-events:none;z-index:0;';
  hero.insertBefore(canvas, hero.firstChild);

  const gl = canvas.getContext('webgl', { alpha: true, antialias: false, powerPreference: 'low-power' });
  if (!gl) { canvas.remove(); return; }

  hero.classList.add('webgl-active');

  const DPR = Math.min(devicePixelRatio || 1, 1.5);
  function resize() {
    canvas.width  = Math.max(1, hero.offsetWidth  * DPR);
    canvas.height = Math.max(1, hero.offsetHeight * DPR);
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resize();
  new ResizeObserver(resize).observe(hero);

  function compileShader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error('shader error:', gl.getShaderInfoLog(s));
    }
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

  const RIPPLES = 10;
  const frag = `
    precision highp float;
    varying vec2 v_uv;
    uniform vec2  u_res;
    uniform float u_time;
    uniform vec3  u_accent;
    uniform float u_dark;
    uniform vec2  u_ptr;
    uniform vec4  u_rip[${RIPPLES}];

    float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
    float vnoise(vec2 p){
      vec2 i = floor(p), f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1.0,0.0)), u.x),
                 mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x), u.y);
    }
    float fbm(vec2 p){
      float v = 0.0, a = 0.5;
      for (int k = 0; k < 4; k++){ v += a * vnoise(p); p *= 2.03; a *= 0.5; }
      return v;
    }

    void main() {
      vec2 p = v_uv - 0.5;
      p.x *= u_res.x / u_res.y;

      float t = u_time * 0.05;

      // ripples: expanding, fading rings that also bend the flow field
      vec2 disp = vec2(0.0);
      float glow = 0.0;
      for (int i = 0; i < ${RIPPLES}; i++){
        float age = u_rip[i].z;
        if (age < 0.0 || age > 2.5) continue;
        vec2 d = p - u_rip[i].xy;
        float len = length(d) + 1e-4;
        float ring = sin(26.0 * len - 7.0 * age) * exp(-2.0 * age) * exp(-5.5 * len);
        disp += (d / len) * ring * 0.028;
        glow += exp(-2.6 * age) * exp(-11.0 * len) * 0.30;
      }

      // pointer: soft glow + local bend
      float pd = length(p - u_ptr);
      glow += exp(-9.0 * pd) * 0.18;
      vec2 pv = p - u_ptr;
      disp += vec2(-pv.y, pv.x) * exp(-7.0 * pd) * 0.05;

      // domain-warped fluid
      vec2 w = vec2(fbm(p * 1.6 + vec2(t, -t * 0.7) + disp * 3.0),
                    fbm(p * 1.6 + vec2(-t * 0.6, t) + 3.7 + disp * 3.0));
      float n = fbm(p * 2.1 + w * 1.5 + disp * 6.0);

      // deep teal palette (site hero colors)
      vec3 deep = vec3(0.016, 0.110, 0.104);
      vec3 mid  = vec3(0.039, 0.290, 0.271);
      vec3 hi   = vec3(0.055, 0.480, 0.443);
      float dim = 1.0 - u_dark * 0.35;
      vec3 col = mix(deep, mid, smoothstep(0.28, 0.78, n));
      col = mix(col, hi, smoothstep(0.66, 0.96, n) * 0.55);
      col *= dim;

      // accent shimmer on ridges + tinted interaction glow
      float ridge = smoothstep(0.66, 0.78, n) * smoothstep(0.92, 0.80, n);
      col += u_accent * ridge * 0.09;
      col += u_accent * glow;

      // readability: darken top (clock) and bottom (name) bands
      float dk = smoothstep(0.45, 0.0, v_uv.y) * 0.22 + smoothstep(0.60, 1.0, v_uv.y) * 0.30;
      col *= (1.0 - dk);

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  const prog = gl.createProgram();
  gl.attachShader(prog, compileShader(gl.VERTEX_SHADER, vert));
  gl.attachShader(prog, compileShader(gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { console.error(gl.getProgramInfoLog(prog)); canvas.remove(); return; }
  gl.useProgram(prog);

  const quad = new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uRes    = gl.getUniformLocation(prog, 'u_res');
  const uTime   = gl.getUniformLocation(prog, 'u_time');
  const uAccent = gl.getUniformLocation(prog, 'u_accent');
  const uDark   = gl.getUniformLocation(prog, 'u_dark');
  const uPtr    = gl.getUniformLocation(prog, 'u_ptr');
  const uRip    = gl.getUniformLocation(prog, 'u_rip');

  // ── interaction state ──
  const ripples = [];            // {x, y, t0}
  let ptr = [ -10, -10 ];
  let lastMove = 0, lastRipple = 0;

  function toField(e) {
    const r = hero.getBoundingClientRect();
    const aspect = r.width / r.height;
    return [ ((e.clientX - r.left) / r.width - 0.5) * aspect,
             ((e.clientY - r.top) / r.height - 0.5) ];
  }
  function addRipple(x, y) {
    ripples.push({ x, y, t0: performance.now() });
    if (ripples.length > RIPPLES) ripples.shift();
  }
  hero.addEventListener('pointermove', e => {
    ptr = toField(e);
    lastMove = performance.now();
    if (lastMove - lastRipple > 110) { lastRipple = lastMove; addRipple(ptr[0], ptr[1]); }
  }, { passive: true });
  hero.addEventListener('pointerdown', e => {
    ptr = toField(e);
    lastMove = lastRipple = performance.now();
    addRipple(ptr[0], ptr[1]);
  }, { passive: true });
  hero.addEventListener('pointerleave', () => { ptr = [ -10, -10 ]; });

  // ── theme hooks: accent color follows 氛围灯, palette follows 暗夜模式 ──
  let accent = [ 0.815, 0.353, 0.188 ], dark = 0, themeTick = 0;
  function hexToRgb(h) {
    h = h.trim().replace('#', '');
    if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    const v = parseInt(h, 16);
    return isNaN(v) ? [0.815, 0.353, 0.188] : [ (v>>16 & 255)/255, (v>>8 & 255)/255, (v & 255)/255 ];
  }
  function readTheme() {
    accent = hexToRgb(getComputedStyle(document.documentElement).getPropertyValue('--color-accent'));
    dark = document.documentElement.getAttribute('data-theme') === 'dark' ? 1 : 0;
  }
  readTheme();

  // ── render loop: pause offscreen/hidden, half-rate when idle ──
  let visible = true, frame = 0;
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(hero);

  const ripFlat = new Float32Array(RIPPLES * 4).fill(-1);
  const start = performance.now();
  function tick(now) {
    requestAnimationFrame(tick);
    if (!visible || document.hidden) return;
    frame++;
    const idle = now - lastMove > 3000;
    if (idle && frame % 2) return;               // ~30fps when idle
    if (++themeTick > 30) { themeTick = 0; readTheme(); }

    for (let i = 0; i < RIPPLES; i++) {
      const r = ripples[i];
      ripFlat[i*4]   = r ? r.x : -10;
      ripFlat[i*4+1] = r ? r.y : -10;
      ripFlat[i*4+2] = r ? (now - r.t0) / 1000 : -1;
      ripFlat[i*4+3] = 0;
    }
    gl.useProgram(prog);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, (now - start) * 0.001);
    gl.uniform3f(uAccent, accent[0], accent[1], accent[2]);
    gl.uniform1f(uDark, dark);
    gl.uniform2f(uPtr, ptr[0], ptr[1]);
    gl.uniform4fv(uRip, ripFlat);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
  requestAnimationFrame(tick);
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
