// toggleCallSpeaker — extracted from index.html
// Owner SHA-256: 442e81b970534a66054f15b2c07df41e6cb82fc1e3e011305dde01d023fdd2cf
// Classic script — exposes window.toggleCallSpeaker

window.toggleCallSpeaker = function toggleCallSpeaker() {
  _callState.isSpeaker = !_callState.isSpeaker; const audio = document.getElementById('nova-call-remote-audio');
  if (audio && audio.setSinkId) { audio.setSinkId(_callState.isSpeaker ? 'default' : '').catch(() => {}); }
  const btn = document.getElementById('nova-call-speaker-btn'); if (btn) btn.style.background = _callState.isSpeaker ? 'rgba(0,229,255,0.3)' : 'rgba(255,255,255,0.15)'
  toast(_callState.isSpeaker ? '🔊 Speaker on' : '🔉 Earpiece');
};
