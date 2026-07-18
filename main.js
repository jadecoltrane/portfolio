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

// ── Text scramble on name → subtitle fades in after ──────────────────────────
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

if (cnEl && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const name = cnEl.textContent;
  cnEl.innerHTML = name.split('').map(() => '<span style="opacity:0">_</span>').join('');
  setTimeout(() => {
    new TextScramble(cnEl).setText(name).then(() => {
      if (subtitleEl) subtitleEl.classList.add('revealed');
    });
  }, 500);
} else if (subtitleEl) {
  subtitleEl.classList.add('revealed');
}

// ── Hero card clickable ───────────────────────────────────────────────────────
const heroCard = document.getElementById('heroCard');
if (heroCard) {
  heroCard.addEventListener('click', e => {
    if (e.target.closest('.hero-connect')) return;
    window.location.href = 'resume.html';
  });
}

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

// ── Scroll reveal ─────────────────────────────────────────────────────────────
(function () {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;
  const targets = document.querySelectorAll(
    '.bento .card:not(.card-hero), .case-page .case-header, .case-page .case-meta, .case-page .case-cover, .case-section > *, .case-page .case-nav'
  );
  if (!targets.length) return;
  document.documentElement.classList.add('js-reveal');
  targets.forEach(t => t.classList.add('rv'));

  let batch = 0, lastTime = 0;
  const io = new IntersectionObserver(entries => {
    const now = performance.now();
    if (now - lastTime > 400) batch = 0;
    lastTime = now;
    for (const en of entries) {
      if (!en.isIntersecting) continue;
      const el = en.target;
      el.style.transitionDelay = Math.min(batch++ * 70, 350) + 'ms';
      el.classList.add('rv-in');
      el.addEventListener('transitionend', () => {
        el.style.transitionDelay = '';
        el.classList.add('rv-done');
      }, { once: true });
      io.unobserve(el);
    }
  }, { threshold: 0.06, rootMargin: '0px 0px -8% 0px' });
  targets.forEach(t => io.observe(t));
})();
