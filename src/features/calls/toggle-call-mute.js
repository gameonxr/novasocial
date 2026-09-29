// toggleCallMute — extracted from index.html
// Owner SHA-256: b79c4765e651eb0afaa8544d81d9ed9387b94063b39da98d8df6cd693f5ab6f7
// Classic script — exposes window.toggleCallMute

window.toggleCallMute = function toggleCallMute() {
  if (!_callState.localStream) return; _callState.isMuted = !_callState.isMuted;
  _callState.localStream.getAudioTracks().forEach(track => track.enabled = !_callState.isMuted);
  const btn = document.getElementById('nova-call-mute-btn'); if (btn) btn.style.background = _callState.isMuted ? 'rgba(225,48,108,0.8)' : 'rgba(255,255,255,0.15)';
  toast(_callState.isMuted ? '🔇 Muted' : '🎤 Unmuted');
};
