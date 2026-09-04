// stopRingtone — extracted from index.html
// Owner SHA-256: cf1f5d2d86898b2d574fa3a97529ca2d0c9f1402a73823e6e8e3b0209f873649
// Classic script — exposes window.stopRingtone

window.stopRingtone = function stopRingtone() { try { if (window._ringtoneCtx) { window._ringtoneCtx.close(); window._ringtoneCtx = null; } } catch(e) {} };
