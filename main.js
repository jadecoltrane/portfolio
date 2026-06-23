// ── Clock ───────────────────────────────────────────────────────────────────
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

// ── Time ambient ───────────────────────────────────────────────────────────────
const ambientThemes = [
  { hours: [23, 6],  bg: '#EEEAF5', tint: 'rgba(10, 5, 30, 1)',    opacity: 0.55 },
  { hours: [6, 10],  bg: '#F8F5EE', tint: 'rgba(180, 120, 20, 1)', opacity: 0.25 },
  { hours: [10, 17], bg: '#F8F5F8', tint: 'transparent',            opacity: 0    },
  { hours: [17, 23], bg: '#F5F0F8', tint: 'rgba(20, 5, 50, 1)',    opacity: 0.3  },
];

function getAmbient() {
  const h = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Shanghai' })).getHours();
  if (h >= 23 || h < 6)  return ambientThemes[0];
  if (h >= 6  && h < 10) return ambientThemes[1];
  if (h >= 10 && h < 17) return ambientThemes[2];
  return ambientThemes[3];
}
function applyAmbient() {
  const t = getAmbient();
  const overlay = document.getElementById('timeOverlay');
  if (!overlay) return;
  document.documentElement.style.setProperty('--color-bg', t.bg);
  document.body.style.backgroundColor = t.bg;
  overlay.style.backgroundColor = t.tint;
  requestAnimationFrame(() => requestAnimationFrame(() => { overlay.style.opacity = t.opacity; }));
}
applyAmbient();
setInterval(applyAmbient, 300000);

// ── Hero WebGL organic flow ──────────────────────────────────────────────────
function initHeroEffect() {
  const hero = document.querySelector('.card-hero');
  if (!hero) return;

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border-radius:inherit;pointer-events:none;z-index:0;';
  hero.insertBefore(canvas, hero.firstChild);

  const gl = canvas.getContext('webgl');
  if (!gl) { canvas.remove(); return; }

  hero.classList.add('webgl-active');

  function resize() {
    const dpr = Math.min(window.devicePixelRatio, 2);
    canvas.width  = hero.offsetWidth  * dpr;
    canvas.height = hero.offsetHeight * dpr;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resize();
  new ResizeObserver(resize).observe(hero);

  const vert = `
    attribute vec2 a_pos;
    void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
  `;

  const frag = `
    precision highp float;
    uniform float u_time;
    uniform vec2  u_res;

    vec2 hash(vec2 p) {
      p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
      return -1.0 + 2.0 * fract(sin(p) * 43758.5453);
    }

    float gnoise(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(dot(hash(i),             f),
            dot(hash(i + vec2(1,0)), f - vec2(1,0)), u.x),
        mix(dot(hash(i + vec2(0,1)), f - vec2(0,1)),
            dot(hash(i + vec2(1,1)), f - vec2(1,1)), u.x),
        u.y);
    }

    mat2 rot2(float a) { float c=cos(a),s=sin(a); return mat2(c,-s,s,c); }

    float fbm(vec2 p) {
      float v = 0.0, a = 0.5;
      mat2 r = rot2(0.5);
      for (int i = 0; i < 6; i++) {
        v += a * gnoise(p);
        p  = r * p * 2.1 + vec2(3.1, 7.4);
        a *= 0.48;
      }
      return v;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_res;
      uv.y = 1.0 - uv.y;

      float t = u_time * 0.12;

      // Two layers of warped FBM — same technique as Unicorn Studio fluid effects
      vec2 q = vec2(fbm(uv * 2.8 + vec2(0.0,  0.0) + t * 0.3),
                    fbm(uv * 2.8 + vec2(5.2,  1.3) + t * 0.25));

      vec2 r = vec2(fbm(uv * 2.4 + 3.5 * q + vec2(1.7 + t * 0.15, 9.2)),
                    fbm(uv * 2.4 + 3.5 * q + vec2(8.3 + t * 0.12,  2.8)));

      float f = fbm(uv * 1.8 + 3.0 * r + t * 0.08);
      f = f * 0.5 + 0.5;

      // Teal palette: deep → mid → bright → highlight
      vec3 c0 = vec3(0.022, 0.180, 0.172); // #083A38 darkest
      vec3 c1 = vec3(0.039, 0.369, 0.345); // #0A5E58
      vec3 c2 = vec3(0.055, 0.510, 0.471); // #0E8278
      vec3 c3 = vec3(0.098, 0.686, 0.627); // #19AFA0 brightest

      float lq = clamp(length(q) * 0.7, 0.0, 1.0);
      float lr = clamp(length(r) * 0.6, 0.0, 1.0);

      vec3 col = mix(c0, c1, f * f);
      col = mix(col, c2, lq);
      col = mix(col, c3, lr * lr * 0.6);

      // Soft light bloom at top-centre
      float bloom = smoothstep(0.5, 0.0, length(uv - vec2(0.5, 0.25)));
      col += vec3(0.04, 0.12, 0.10) * bloom * 0.6;

      // Subtle vignette
      float vig = uv.x * (1.0-uv.x) * uv.y * (1.0-uv.y);
      col *= 0.7 + 0.5 * pow(vig * 16.0, 0.18);

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  function compileShader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    return s;
  }
  const prog = gl.createProgram();
  gl.attachShader(prog, compileShader(gl.VERTEX_SHADER, vert));
  gl.attachShader(prog, compileShader(gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uTime = gl.getUniformLocation(prog, 'u_time');
  const uRes  = gl.getUniformLocation(prog, 'u_res');

  const t0 = performance.now();
  function render() {
    gl.uniform1f(uTime, (performance.now() - t0) / 1000);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(render);
  }
  render();
}
initHeroEffect();

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
document.querySelectorAll('a, .lang-btn').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-on-link'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-on-link'));
});
