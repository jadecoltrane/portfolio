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


// ── Hero: flowing cyanotype gradient (blue + cream), fully generative ─────────
function initHeroFlow() {
  const hero = document.querySelector('.card-hero');
  if (!hero) return;

  hero.style.backgroundImage = 'none';
  hero.style.backgroundColor = '#4A6682';

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
    uniform vec2  u_res;
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
      // Aspect-correct coords so noise cells stay round
      vec2 p = v_uv - 0.5;
      p.x *= u_res.x / u_res.y;

      // Cyanotype palette pulled from the photo
      vec3 blueDark = vec3(0.255, 0.357, 0.475);  // #41597A
      vec3 blueMid  = vec3(0.494, 0.604, 0.710);  // #7E9AB5
      vec3 cream    = vec3(0.937, 0.910, 0.835);  // #EFE8D5
      vec3 mist     = vec3(0.792, 0.847, 0.886);  // #CAD8E2

      // Slow drifting + domain warp → the whole field flows as one mass
      float t = u_time * 0.06;
      vec2 flow = vec2(t * 0.35, t * 0.22);
      vec2 w = vec2(
        fbm(p * 1.2 + flow),
        fbm(p * 1.2 + flow + 7.3)
      );
      float n1 = fbm(p * 1.7 + w * 0.9 + flow * 0.5);
      float n2 = fbm(p * 2.6 - w * 0.6 + flow * 0.3 + 13.0);

      // Layer the palette: blue base → cream glow blobs → soft mist highlights
      vec3 col = mix(blueDark, blueMid, smoothstep(0.28, 0.72, n1));
      col = mix(col, cream, smoothstep(0.40, 0.70, n2));
      col = mix(col, mist,  smoothstep(0.55, 0.85, (n1 + n2) * 0.5) * 0.5);

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

  const uRes  = gl.getUniformLocation(prog, 'u_res');
  const uTime = gl.getUniformLocation(prog, 'u_time');

  const start = Date.now();
  function tick() {
    gl.useProgram(prog);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, (Date.now() - start) * 0.001);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(tick);
  }
  tick();
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
