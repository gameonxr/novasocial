// initiateCall — extracted from index.html
// Owner SHA-256: d15dd449bc177bb23d26da846b838bf3ab446845cb2bf1bce842191586d3021d
// Classic script — exposes window.initiateCall

window.initiateCall = async function initiateCall(userId, userName, userAvatar, callType) {
  callType = callType || 'audio';
  if (_callState.active) { toast('Pehle current call khatam karo'); return; }
  let callId;
  try {
    const { data: callRow, error } = await db.from('calls').insert({ caller_id: ME.id, callee_id: userId, call_type: callType, status: 'ringing' }).select().single();
    if (error) throw error; callId = callRow.id;
    console.log('%c[CALL] Call row created, id=' + callId, 'color:lime;font-weight:bold');
  } catch(e) { toast('Call start nahi hua: ' + (e.message || 'error')); return; }
  _callState.active = true; _callState.callId = callId; _callState.callType = callType; _callState.isOutgoing = true; _callState.remoteUserId = userId; _callState.remoteUserName = userName || 'User'; _callState.remoteUserAvatar = userAvatar || ''; _callState.startTime = Date.now();
  showCallScreen(); await setupLocalMedia(); await setupWebRTCCaller(callId, userId);
  if (window._callRingTimeout) clearTimeout(window._callRingTimeout);
  window._callRingTimeout = setTimeout(async () => {
    if (_callState.active && _callState.callId === callId && !_callState.timerInterval) {
      toast('📞 No answer');
      try { await db.from('calls').update({ status: 'missed' }).eq('id', callId); } catch(e) {}
      endCall(false);
    }
  }, 30000);
};
