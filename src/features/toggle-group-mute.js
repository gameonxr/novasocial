// toggleGroupMute — extracted from index.html
// Owner SHA-256: 9af33bd8b880aac65d71f997f6c544286f9921dc1d194cea1018836955458b32
// Classic script — exposes window.toggleGroupMute

window.toggleGroupMute = function toggleGroupMute() {
  if (!_groupCallState.localStream) return;
  _groupCallState.isMuted = !_groupCallState.isMuted;
  _groupCallState.localStream.getAudioTracks().forEach(t => t.enabled = !_groupCallState.isMuted);
  const btn = document.getElementById('gc-mute-btn');
  if (btn) btn.style.background = _groupCallState.isMuted ? 'rgba(225,48,108,0.8)' : 'rgba(255,255,255,0.15)';
  db.from('group_call_participants').update({ is_muted: _groupCallState.isMuted })
    .eq('session_id', _groupCallState.sessionId).eq('user_id', ME.id).then(()=>{});
};
