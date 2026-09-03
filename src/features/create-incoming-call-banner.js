// createIncomingCallBanner — extracted from index.html
// Owner SHA-256: a4d0cf9f6f05cab1491316472a6f69c1856b7d80d7b9bd5271322e9d3057948b
// Classic script — exposes window.createIncomingCallBanner

window.createIncomingCallBanner = function createIncomingCallBanner() {
  const existing = document.getElementById('nova-incoming-call'); if (existing) return existing;
  const banner = document.createElement('div'); banner.id = 'nova-incoming-call'; document.body.appendChild(banner); return banner;
};
