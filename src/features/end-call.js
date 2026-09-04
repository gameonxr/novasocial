// endCall — extracted from index.html
// Owner SHA-256: badd08080c6f48185cf8ff948db804495d0c40a45cbb510d2a0ccc79aea3fdde
// Classic script — exposes window.endCall

window.endCall = async function endCall(updateDB) {
  console.log('%c[CALL] endCall() triggered | updateDB=' + updateDB + ' | stack trace:', 'color:red;font-weight:bold', new Error().stack);
  if (updateDB === undefined) updateDB = true;
  if (!_callState.active && !_callState.callId) return;
  if (_callState.timerInterval) { clearInterval(_callState.timerInterval); _callState.timerInterval = null; }
  const durationSeconds = _callState.startTime ? Math.floor((Date.now() - _callState.startTime) / 1000) : 0;
  if (updateDB && _callState.callId) { try { await db.from('call_signals').insert({ call_id: _callState.callId, sender_id: ME.id, signal_type: 'end', signal_data: JSON.stringify({ ended_by: ME.id }) }); await db.from('calls').update({ status: 'ended', ended_at: new Date().toISOString(), duration_seconds: durationSeconds }).eq('id', _callState.callId); } catch(e) {} }
  if (_callState.peer) { try { _callState.peer.close(); } catch(e) {} _callState.peer = null; }
  if (_callState.localStream) { _callState.localStream.getTracks().forEach(t => { try { t.stop(); } catch(e) {} }); _callState.localStream = null; }
  if (_callState.signalSub) { db.removeChannel(_callState.signalSub); _callState.signalSub = null; }
  if (window._callStatusSub) { db.removeChannel(window._callStatusSub); window._callStatusSub = null; }
  _callState.active = false; _callState.callId = null; _callState.remoteUserId = null; _callState.remoteUserName = null; _callState.remoteUserAvatar = null; _callState.startTime = null; _callState.isMuted = false; _callState.isVideoOff = false; _callState.isSpeaker = false; _callState.remoteStream = null; window._pendingIceCandidates = [];
  // ── FIX 5: Reconnect timeout cleanup (taaki leak na ho) ──
  if(window._callReconnectTimeout) { clearTimeout(window._callReconnectTimeout); window._callReconnectTimeout = null; }
  const screen = document.getElementById('nova-call-screen'); if (screen) { screen.classList.remove('show'); setTimeout(() => screen.remove(), 300); }
  stopRingtone();
  stopNetworkMonitor();
  if (window._callRingTimeout) { clearTimeout(window._callRingTimeout); window._callRingTimeout = null; }
  const bubble = document.getElementById('nova-call-bubble');
  if(bubble) bubble.remove();
  _callState.isMinimized = false;
  if (durationSeconds > 0) { const mins = Math.floor(durationSeconds / 60); const secs = durationSeconds % 60; toast('Call ended (' + mins + ':' + String(secs).padStart(2,'0') + ')'); } else toast('Call ended');
};
