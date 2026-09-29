// _tryRestoreFromCache — extracted from index.html
// Owner SHA-256: 86a6e3056e17f5261d2787621a537ffba58f6ce3249f58ee708e59b1d4d26d80
// Classic script — exposes window._tryRestoreFromCache

window._tryRestoreFromCache = function _tryRestoreFromCache(tab) {
  const config = TAB_CACHE_CONFIG[tab];
  if (!config || !config.cache) return false;

  // ── REELS SPECIAL HANDLING: reels ko persistent-container mechanism se handle karo ──
  // Reels ke liye HTML cache use mat karo (video state preserve karne ke liye alag approach hai)
  if (tab === 'reels') {
    const existingContainer = document.getElementById('reels-persistent-container');
    if (existingContainer) {
      const scr = document.getElementById('screen');
      if (scr) {
        scr.innerHTML = '';
        scr.appendChild(existingContainer);
        existingContainer.style.display = 'block';

        // ── SPLIT-VIEW FIX: #screen MUST be overflow:hidden + scrollTop:0 for Reels ──
        // Reels uses CSS transform on #rinner for sliding — #screen itself must NOT
        // scroll natively. Other tabs leave #screen.overflow='auto' (their content is
        // taller than viewport). If we don't reset here, leftover scroll position +
        // 'auto' overflow creates a competing native-scroll layer over the transform
        // layer — causing the "split/torn" view bug.
        scr.style.overflow = 'hidden';
        scr.scrollTop = 0;

        // Bug 2 Fix: Restore transform + transition guard to prevent split-view glitch
        const savedIdx = window._savedReelIndex || 0;
        const rinner = document.getElementById('rinner');
        if (rinner) {
          // Count reel slides to get correct percentage math
          const reelCount = rinner.children.length;
          if (reelCount > 0) {
            rinner.style.transition = 'none'; // No animation during restore
            rinner.style.transform = `translateY(-${savedIdx * (100 / reelCount)}%)`;
            // Re-enable transition next frame for smooth future swipes
            requestAnimationFrame(() => {
              rinner.style.transition = '';
            });
          }
        }

        // Apply video windowing for restored position
        try { _applyReelsVideoWindowing(savedIdx); } catch(_) {}

        // Play the correct reel video
        try {
          const v = document.getElementById('rv-'+savedIdx);
          if (v) { v.muted = reelsMuted; v.play().catch(()=>{}); }
        } catch(_) {}
      }
      return true; // restored via persistent container
    }
    return false; // first time — let renderReels() build it
  }

  const cached = _tabCache[tab];
  if (!cached) return false;

  // Infinity maxAge means never expire (reels uses persistent-container instead, so this branch skipped above)
  if (config.maxAge !== Infinity) {
    const age = Date.now() - cached.timestamp;
    if (age > config.maxAge) return false; // Cache stale ho gaya
  }

  const scr = document.getElementById('screen');
  if (!scr) return false;

  // INSTANT RESTORE — koi skeleton, koi loading, seedha purana content
  scr.innerHTML = cached.html;
  scr.style.overflow = 'auto';
  scr.style.display = 'block';

  // ── INSTANT SCROLL RESTORE (all tabs, including DMs) ──
  // scrollTop ko defer karo to next-next animation frame — browser ko content
  // layout/paint hone ka mauka do. Agar immediate assign karein (especially
  // taller content like long chat list ke saath), browser ne layout abhi settle
  // nahi kiya hota, scrollTop silently clamp ho jaata hai. Double rAF is more
  // reliable than single rAF for ensuring layout has actually completed.
  //
  // DMs note: _silentBackgroundRefresh used to do a full destructive renderDMs()
  // here, requiring elaborate scroll-override/race-prevention logic. That's been
  // replaced with _refreshDmsInPlace() — a non-destructive in-place DOM patch
  // (Home-tab-style) that NEVER replaces #screen's innerHTML, so scrollTop is
  // NEVER reset. This fast-restore's double-rAF is now the ONLY place scroll
  // position gets set for DMs. No flag-tracking, no user-scroll listener, no
  // end-of-cycle rAF in renderDMs(). Architecturally clean.
  const targetScrollTop = _tabScrollPos[tab] || 0;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      scr.scrollTop = targetScrollTop;
    });
  });

  return true;
};
