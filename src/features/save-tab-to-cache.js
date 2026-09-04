// _saveTabToCache — extracted from index.html
// Owner SHA-256: 77800831bd3f6d06d6fbe6a9ed8273ecac95b48cf6abf9ed280491fd984a3f67
// Classic script — exposes window._saveTabToCache

window._saveTabToCache = function _saveTabToCache(tab) {
  const scr = document.getElementById('screen');
  if (!scr) return;

  // Never snapshot chat DOM as the DMs tab. Chat and DMs share #screen while
  // curTab remains 'dms'; this preserves the last valid DMs list cache.
  if (tab === 'dms' && window._chatScreenActive) return;

  // Scroll position HAMESHA save karo (chahe cache disabled ho)
  _tabScrollPos[tab] = scr.scrollTop;

  const config = TAB_CACHE_CONFIG[tab];
  if (!config || !config.cache) return; // HTML cache sirf enabled tabs ke liye

  // ── REELS SPECIAL: HTML cache mat karo — persistent-container alag se handle hota hai ──
  if (tab === 'reels') return;

  _tabCache[tab] = {
    html: scr.innerHTML,
    timestamp: Date.now(),
  };
};
