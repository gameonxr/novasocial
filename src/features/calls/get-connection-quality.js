// getConnectionQuality — extracted from index.html
// Owner SHA-256: 72de5de9ce186bf1d416cc4b41fba65631ecbb80cb580cda781bf076a37de95b
// Classic script — exposes window.getConnectionQuality

window.getConnectionQuality = function getConnectionQuality() {
  // Vendor-prefixed access (Safari/Firefox/Chrome legacy)
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!conn || !conn.effectiveType) return 'good'; // unsupported → default
  if (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g') return 'low';
  if (conn.effectiveType === '3g') return 'eco';
  return 'good'; // 4g or unknown
};
