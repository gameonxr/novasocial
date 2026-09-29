window._applyReelsVideoWindowing = function(currentIndex) {
  const videos = document.querySelectorAll('.rvid');
  if (!videos || !videos.length) return;

  const windowStart = currentIndex - 1;
  const windowEnd = currentIndex + 3;

  videos.forEach(v => {
    // Index parse karo from id="rv-{i}"
    const idMatch = v.id && v.id.match(/^rv-(\d+)$/);
    if (!idMatch) return;
    const idx = parseInt(idMatch[1], 10);

    const inWindow = (idx >= windowStart && idx <= windowEnd);
    const storedUrl = v.dataset.mediaUrl;
    if (!storedUrl) return; // fallback/placeholder video — leave alone

    if (inWindow) {
      // Window ke andar — agar src missing hai, restore karo
      if (!v.src) {
        v.src = storedUrl;
      }
    } else {
      // Window ke bahar — agar src set hai, hata do (memory free)
      if (v.src) {
        v.removeAttribute('src');
        try { v.load(); } catch(_) {} // force browser to release decoded frames
      }
    }
  });
};
