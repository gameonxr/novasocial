// leaveGroupCall — extracted from index.html
// Owner SHA-256: 10a30178492ef25276b7e1efbca47c15fc9da4c6dab146a7803ce9ec57e546e9
// Classic script — exposes window.leaveGroupCall

window.leaveGroupCall = async function leaveGroupCall() {
  if (!_groupCallState.active) return;

  try {
    await db.from('call_signals').insert({
      group_session_id: _groupCallState.sessionId, sender_id: ME.id, target_id: null,
      signal_type: 'leave', signal_data: '{}'
    });
    await db.from('group_call_participants').update({ left_at: new Date().toISOString() })
      .eq('session_id', _groupCallState.sessionId).eq('user_id', ME.id);
  } catch(e) {}

  Object.values(_groupCallState.peers).forEach(p => { try { p.close(); } catch(e) {} });
  _groupCallState.peers = {};

  if (_groupCallState.localStream) {
    _groupCallState.localStream.getTracks().forEach(t => { try { t.stop(); } catch(e) {} });
  }
  if (_groupCallState.signalsSub) db.removeChannel(_groupCallState.signalsSub);
  if (_groupCallState.participantsSub) db.removeChannel(_groupCallState.participantsSub);
  if (window._gcAudioCtx) { try { window._gcAudioCtx.close(); } catch(e) {} window._gcAudioCtx = null; }

  const screen = document.getElementById('nova-call-screen');
  if (screen) { screen.classList.remove('show'); setTimeout(() => screen.remove(), 300); }

  _groupCallState.active = false;
  _groupCallState.sessionId = null;
  _groupCallState.localStream = null;
  _groupCallState.audioAnalysers = {};

  toast('📞 Left the call');
};
