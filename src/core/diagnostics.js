// ═══════════════════════════════════════════════════════════════════════
// GLOBAL ERROR HANDLER — Silent crashes catch karo
// World-wide release ke liye zaroori: koi bhi function crash ho
// toh console mein clearly dikhe, app silently na atke
// ═══════════════════════════════════════════════════════════════════════
window.addEventListener('error', (e) => {
  console.error('🔴 Global JS Error:', e.message,
    'at', (e.filename || 'unknown') + ':' + (e.lineno || '?') + ':' + (e.colno || '?'),
    e.error?.stack || '');
  // Dev mode (localhost) mein user ko bhi batao
  if(typeof toast === 'function' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    try { toast('⚠️ Error: ' + e.message); } catch(_) {}
  }
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('🔴 Unhandled Promise Rejection:', e.reason);
  // Prevent default console spam, but keep the log above
  e.preventDefault();
});
