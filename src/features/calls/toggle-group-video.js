// toggleGroupVideo — extracted from index.html
// Owner SHA-256: 49d8cf6f33ccb3a1af397d8e1efe84e29db8c26e44c4ea8bee20dce698e33619
// Classic script — exposes window.toggleGroupVideo

window.toggleGroupVideo = function toggleGroupVideo() {
  if (!_groupCallState.localStream || _groupCallState.callType !== 'video') return;
  _groupCallState.isVideoOff = !_groupCallState.isVideoOff;
  _groupCallState.localStream.getVideoTracks().forEach(t => t.enabled = !_groupCallState.isVideoOff);
  const btn = document.getElementById('gc-video-btn');
  if (btn) btn.style.background = _groupCallState.isVideoOff ? 'rgba(225,48,108,0.8)' : 'rgba(255,255,255,0.15)';
};
