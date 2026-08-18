// Optimistic following-count DOM updater.
async function updateMyFollowingCount(delta) {
  const fel = document.getElementById('following-count');
  if (fel) {
    let raw = parseInt(fel.dataset.raw || 0) + delta;
    raw = Math.max(0, raw);
    fel.dataset.raw = raw;
    fel.textContent = fmt(raw);
  }
}
