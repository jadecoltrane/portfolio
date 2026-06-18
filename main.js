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

// ── Time ambient theming ──────────────────────────────────────────────────────
const ambientThemes = [
  { hours: [23, 6],  bg: '#EDEAF5', tint: 'rgba(18, 32, 72, 1)',   opacity: 0.52 }, // night
  { hours: [6, 10],  bg: '#FBF8EE', tint: 'rgba(210, 148, 30, 1)', opacity: 0.32 }, // morning
  { hours: [10, 17], bg: '#FAF7F3', tint: 'transparent',            opacity: 0    }, // day
  { hours: [17, 23], bg: '#F6F0EE', tint: 'rgba(70, 12, 22, 1)',   opacity: 0.28 }, // evening
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
  requestAnimationFrame(() => requestAnimationFrame(() => {
    overlay.style.opacity = t.opacity;
  }));
}

applyAmbient();
setInterval(applyAmbient, 300000);

// ── A: Card tilt ──────────────────────────────────────────────────────────────
document.querySelectorAll('.card-project, .card-resume').forEach(card => {
  card.classList.add('has-tilt');
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) scale(1.02)`;
    card.style.boxShadow = '0 20px 48px rgba(0,0,0,0.12)';
    card.style.transition = 'transform 0.08s ease, box-shadow 0.08s ease';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.boxShadow = '';
    card.style.transition = 'transform 0.6s cubic-bezier(0.23,1,0.32,1), box-shadow 0.6s cubic-bezier(0.23,1,0.32,1)';
  });
});

// ── B: Magnetic connect button ────────────────────────────────────────────────
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

// ── C: Text scramble ──────────────────────────────────────────────────────────
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
if (cnEl) {
  const name = cnEl.textContent;
  cnEl.innerHTML = name.split('').map(() => '<span style="opacity:0">_</span>').join('');
  setTimeout(() => new TextScramble(cnEl).setText(name), 500);
}

// ── D: Hero card clickable ────────────────────────────────────────────────────
const heroCard = document.getElementById('heroCard');
if (heroCard) {
  heroCard.addEventListener('click', e => {
    if (e.target.closest('.hero-connect')) return;
    window.location.href = 'resume.html';
  });
}

// ── E: Spotlight ──────────────────────────────────────────────────────────────
const hero = document.querySelector('.card-hero');
if (hero) {
  hero.addEventListener('mousemove', e => {
    const r = hero.getBoundingClientRect();
    hero.style.setProperty('--mx', `${e.clientX - r.left}px`);
    hero.style.setProperty('--my', `${e.clientY - r.top}px`);
  });
}

// ── Custom cursor + Parallax (shared RAF) ────────────────────────────────────
const dot  = document.getElementById('cursorDot');
const ring = document.getElementById('cursorRing');
const middleEl = document.querySelector('.bento-middle');
const rightEl  = document.querySelector('.bento-right');

const hasHover = window.matchMedia('(hover: hover)').matches;

let mx = -100, my = -100;
let rx = -100, ry = -100;
let pmx = 0, pmy = 0;
let plx = 0,  ply = 0;
let cursorVisible = false;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  pmx = (e.clientX / window.innerWidth  - 0.5) * 2;
  pmy = (e.clientY / window.innerHeight - 0.5) * 2;
  if (!cursorVisible) {
    cursorVisible = true;
    if (dot)  { dot.style.opacity  = '1'; }
    if (ring) { ring.style.opacity = '0.45'; }
  }
  if (dot) { dot.style.left = mx + 'px'; dot.style.top = my + 'px'; }
});

document.addEventListener('mouseleave', () => {
  pmx = 0; pmy = 0;
  if (dot)  dot.style.opacity  = '0';
  if (ring) ring.style.opacity = '0';
});

function mainLoop() {
  // Cursor ring lerp
  if (ring && cursorVisible) {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
  }
  // Parallax lerp (desktop only)
  if (hasHover) {
    plx += (pmx - plx) * 0.07;
    ply += (pmy - ply) * 0.07;
    if (middleEl) middleEl.style.transform = `translate(${plx * 8}px, ${ply * 5}px)`;
    if (rightEl)  rightEl.style.transform  = `translate(${plx * 14}px, ${ply * 8}px)`;
  }
  requestAnimationFrame(mainLoop);
}
mainLoop();

// Cursor states
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
