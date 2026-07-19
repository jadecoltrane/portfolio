// ── Language toggle (index) ──────────────────────────────────────────────────
document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const lang = btn.dataset.l;
    document.body.dataset.lang = lang;
    document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN';
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.l === lang));
    document.querySelectorAll('[data-zh]').forEach(el => {
      if (el.dataset[lang]) el.innerHTML = el.dataset[lang];
    });
  });
});

// ── Scroll reveal ────────────────────────────────────────────────────────────
(function () {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;
  const targets = document.querySelectorAll(
    '.hero > *, .glance-panel, .section-head, .work-card, .play-card, .touch-panel, .footer-big,' +
    '.page-head > *, .filter-row,' +
    '.case-header, .case-meta, .case-cover, .case-section > *, .case-nav,' +
    '.resume-page > *, .resume-section, .contact-page > *'
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
      el.style.transitionDelay = Math.min(batch++ * 60, 300) + 'ms';
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

// ── Stat counters ────────────────────────────────────────────────────────────
(function () {
  const nums = document.querySelectorAll('[data-count]');
  if (!nums.length) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const run = el => {
    const target = parseInt(el.dataset.count, 10);
    if (reduced || !('requestAnimationFrame' in window)) { el.textContent = target; return; }
    const dur = 900, t0 = performance.now();
    const tick = now => {
      const p = Math.min((now - t0) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if (!('IntersectionObserver' in window)) { nums.forEach(run); return; }
  const io = new IntersectionObserver(entries => {
    for (const en of entries) {
      if (!en.isIntersecting) continue;
      run(en.target);
      io.unobserve(en.target);
    }
  }, { threshold: 0.4 });
  nums.forEach(n => io.observe(n));
})();

// ── Work page filter ─────────────────────────────────────────────────────────
(function () {
  const btns = document.querySelectorAll('.filter-btn');
  if (!btns.length) return;
  const cards = document.querySelectorAll('.work-card[data-cat]');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const f = btn.dataset.f;
      btns.forEach(b => b.classList.toggle('active', b === btn));
      cards.forEach(c => {
        const show = f === 'all' || c.dataset.cat.split(' ').includes(f);
        c.classList.toggle('is-hidden', !show);
      });
    });
  });
})();
