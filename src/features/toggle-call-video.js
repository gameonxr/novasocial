// toggleCallVideo — extracted from index.html
// Owner SHA-256: 721c5ba28ce16311ae923c89d3046dbf220baa9cb2f83e9dddc96c35ac37cb96
// Classic script — exposes window.toggleCallVideo

window.toggleCallVideo = function toggleCallVideo() {
  if (!_callState.localStream) return; _callState.isVideoOff = !_callState.isVideoOff;
  _callState.localStream.getVideoTracks().forEach(track => track.enabled = !_callState.isVideoOff);
  const btn = document.getElementById('nova-call-video-btn'); if (btn) btn.style.background = _callState.isVideoOff ? 'rgba(225,48,108,0.8)' : 'rgba(255,255,255,0.15)'
  toast(_callState.isVideoOff ? '📵 Camera off' : '📹 Camera on');
};
