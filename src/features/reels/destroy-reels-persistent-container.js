// destroyReelsPersistentContainer — extracted from index.html
// Owner SHA-256: 3ed5c61cd86a52d6d1ace98b6d01dc311606272d6621144e0d87c540273ce101
// Classic script — exposes window.destroyReelsPersistentContainer

window.destroyReelsPersistentContainer = function destroyReelsPersistentContainer() {
  const container = document.getElementById('reels-persistent-container');
  if (container && container.parentNode) {
    container.parentNode.removeChild(container);
  }
  // Reset saved reel index so next rebuild starts at top (index 0)
  window._savedReelIndex = 0;
  // Note: TAB_CACHE_CONFIG.reels = Infinity (intentional, unchanged).
  // Reels never used _tabCache HTML snapshot anyway — only the persistent-container.
};
