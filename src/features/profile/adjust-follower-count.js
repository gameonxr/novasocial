// Optimistic follower-count DOM updater.
async function adjustFollowerCount(delta) {
  const el = document.getElementById('followers-count');
  if (!el) return;
  let raw = parseInt(el.dataset.raw || 0) + delta;
  raw = Math.max(0, raw);
  el.dataset.raw = raw;
  el.textContent = fmt(raw);
}
