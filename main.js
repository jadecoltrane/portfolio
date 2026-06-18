function updateClock() {
  const el = document.getElementById('clock');
  if (!el) return;
  const now = new Date();
  const time = now.toLocaleTimeString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  el.textContent = time;
}

updateClock();
setInterval(updateClock, 1000);

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.card').forEach((card, i) => {
    card.style.animationDelay = `${0.05 + i * 0.07}s`;
  });
});