// Pure local media-deletion fallback queue writer.
function _fallbackLocalQueue(mediaUrl, source, reason) {
  try {
    const pending = JSON.parse(localStorage.getItem('_mediaDeleteFallback') || '[]');
    pending.push({ mediaUrl, source, reason, ts: Date.now() });
    if(pending.length > 500) pending.splice(0, 100); // Drop oldest 100
    localStorage.setItem('_mediaDeleteFallback', JSON.stringify(pending));
  } catch(e) {
    console.warn('Local fallback queue failed:', e);
  }
}
