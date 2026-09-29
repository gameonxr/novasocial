// Pure media filename generator.
function _generateFileName(userId, mediaType) {
  const ts = Date.now(); const rand = Math.random().toString(36).substr(2, 6);
  const uid = (userId || 'u').substr(0, 8); const ext = mediaType === 'video' ? 'mp4' : 'webp';
  return `${uid}_${ts}_${rand}.${ext}`;
}
