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

// ── Hero: blue flower background + glowing blob particle flow ─────────────────
function initHeroParticles() {
  const hero = document.querySelector('.card-hero');
  if (!hero) return;

  hero.style.backgroundImage = "url('hero-flower.jpg')";
  hero.style.backgroundSize = 'cover';
  hero.style.backgroundPosition = 'center 30%';
  hero.style.backgroundRepeat = 'no-repeat';

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border-radius:inherit;pointer-events:none;z-index:0;';
  hero.insertBefore(canvas, hero.firstChild);

  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false });
  if (!gl) { canvas.remove(); return; }

  hero.classList.add('webgl-active');

  let W = 0, H = 0;
  function resize() {
    const dpr = Math.min(devicePixelRatio, 2);
    W = canvas.width  = hero.offsetWidth  * dpr;
    H = canvas.height = hero.offsetHeight * dpr;
    gl.viewport(0, 0, W, H);
  }
  resize();
  new ResizeObserver(resize).observe(hero);

  let mouseX = -99999, mouseY = -99999;
  hero.addEventListener('mousemove', e => {
    const r = hero.getBoundingClientRect();
    mouseX = e.clientX - r.left;
    mouseY = e.clientY - r.top;
  });
  hero.addEventListener('mouseleave', () => { mouseX = -99999; mouseY = -99999; });

  const img = new Image();
  img.onload = () => {
    const offC = document.createElement('canvas');
    offC.width = img.width; offC.height = img.height;
    offC.getContext('2d').drawImage(img, 0, 0);
    const px = offC.getContext('2d').getImageData(0, 0, img.width, img.height).data;

    const STEP  = 4;
    const cardW = hero.offsetWidth;
    const cardH = hero.offsetHeight;
    const s  = Math.max(cardW / img.width, cardH / img.height);
    const ox = (cardW - img.width  * s) / 2;
    const oy = (cardH - img.height * s) * 0.30;  // mirrors background-position: center 30%

    const hx = [], hy = [], cr = [], cg = [], cb = [];

    for (let iy = 0; iy < img.height; iy += STEP) {
      for (let ix = 0; ix < img.width; ix += STEP) {
        const p = (iy * img.width + ix) * 4;
        const r = px[p], g = px[p+1], b = px[p+2], a = px[p+3];
        if (a < 10) continue;

        // Keep bright glow pixels: cream/white blobs and light flower texture
        const rf = r / 255, gf = g / 255, bf = b / 255;
        const brightness = (rf + gf + bf) / 3;
        if (brightness < 0.63) continue;                     // skip dark blue background
        if (bf > rf + 0.08 && brightness < 0.80) continue;  // skip mid-tone blue

        const sx = ix * s + ox;
        const sy = iy * s + oy;
        if (sx < 0 || sx >= cardW || sy < 0 || sy >= cardH) continue;

        hx.push((sx / cardW) * 2 - 1);
        hy.push(1 - (sy / cardH) * 2);
        cr.push(r / 255); cg.push(g / 255); cb.push(b / 255);
      }
    }

    const N = hx.length;
    const posArr = new Float32Array(N * 3);
    const velArr = new Float32Array(N * 2);
    const colArr = new Float32Array(N * 3);

    for (let i = 0; i < N; i++) {
      posArr[i*3] = hx[i]; posArr[i*3+1] = hy[i]; posArr[i*3+2] = 0.5;
      colArr[i*3] = cr[i]; colArr[i*3+1] = cg[i]; colArr[i*3+2] = cb[i];
    }

    function compileShader(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s); return s;
    }

    const ptSize = (6 * Math.min(window.devicePixelRatio || 1, 2)).toFixed(1);
    const vert = `
      attribute vec3 a_posa;
      attribute vec3 a_col;
      varying vec3 v_col;
      varying float v_a;
      void main() {
        gl_Position  = vec4(a_posa.xy, 0.0, 1.0);
        gl_PointSize = ${ptSize};
        v_col = a_col;
        v_a   = a_posa.z;
      }
    `;
    const frag = `
      precision mediump float;
      varying vec3 v_col;
      varying float v_a;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        float soft = 1.0 - smoothstep(0.15, 0.5, d);
        gl_FragColor = vec4(v_col, soft * v_a);
      }
    `;

    const prog = gl.createProgram();
    gl.attachShader(prog, compileShader(gl.VERTEX_SHADER, vert));
    gl.attachShader(prog, compileShader(gl.FRAGMENT_SHADER, frag));
    gl.linkProgram(prog); gl.useProgram(prog);

    const posBuf = gl.createBuffer();
    const colBuf = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, colBuf);
    gl.bufferData(gl.ARRAY_BUFFER, colArr, gl.STATIC_DRAW);

    const aPosa = gl.getAttribLocation(prog, 'a_posa');
    const aCol  = gl.getAttribLocation(prog, 'a_col');

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const RADIUS = 0.28;
    const FORCE  = 0.020;
    const SPRING = 0.022;
    const DAMP   = 0.88;

    function tick() {
      const t = Date.now() * 0.001;
      const mxC = mouseX / cardW * 2 - 1;
      const myC = 1 - mouseY / cardH * 2;
      const hasM = mouseX > -9999;

      for (let i = 0; i < N; i++) {
        let px = posArr[i*3],   py = posArr[i*3+1];
        let vx = velArr[i*2],   vy = velArr[i*2+1];

        // Idle drift: each particle oscillates with a unique phase
        const phX = hx[i] * 23.7 + hy[i] * 11.3;
        const phY = hx[i] * 17.9 + hy[i] * 31.1;
        const targetX = hx[i] + Math.sin(t * 0.45 + phX) * 0.018;
        const targetY = hy[i] + Math.cos(t * 0.30 + phY) * 0.018;

        // Mouse attraction: particles flow toward cursor
        if (hasM) {
          const dx = mxC - px, dy = myC - py;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < RADIUS && dist > 0.001) {
            const f = (1 - dist / RADIUS) * FORCE;
            vx += (dx / dist) * f;
            vy += (dy / dist) * f;
          }
        }

        // Spring toward drift target
        vx += (targetX - px) * SPRING;
        vy += (targetY - py) * SPRING;
        vx *= DAMP; vy *= DAMP;

        posArr[i*3]   = px + vx;
        posArr[i*3+1] = py + vy;
        velArr[i*2]   = vx;
        velArr[i*2+1] = vy;

        // Alpha: always visible base + brightness boost near mouse
        const ddx = posArr[i*3] - mxC, ddy = posArr[i*3+1] - myC;
        const distM = Math.sqrt(ddx * ddx + ddy * ddy);
        const mBoost = hasM ? Math.max(0, 1 - distM / RADIUS) * 0.45 : 0;
        posArr[i*3+2] = 0.48 + mBoost;
      }

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
      gl.bufferData(gl.ARRAY_BUFFER, posArr, gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(aPosa);
      gl.vertexAttribPointer(aPosa, 3, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, colBuf);
      gl.enableVertexAttribArray(aCol);
      gl.vertexAttribPointer(aCol, 3, gl.FLOAT, false, 0, 0);

      gl.drawArrays(gl.POINTS, 0, N);
      requestAnimationFrame(tick);
    }
    tick();
  };
  img.src = 'hero-flower.jpg';
}
initHeroParticles();

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
