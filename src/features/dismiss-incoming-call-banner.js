// dismissIncomingCallBanner — extracted from index.html
// Owner SHA-256: 5e30b29728469daf057e841f57a01c8e4eb0c53214701b5ac1f2511629c378e6
// Classic script — exposes window.dismissIncomingCallBanner

window.dismissIncomingCallBanner = function dismissIncomingCallBanner() {
  stopRingtone(); const banner = document.getElementById('nova-incoming-call'); if (banner) banner.classList.remove('show');
  try { navigator.vibrate(0); } catch(e) {}
};
