// acceptIncomingCall — extracted from index.html
// Owner SHA-256: 1e54e632a41ed68896310d1f1823b810a0919973c0435ca9b6d77138fa97ec15
// Classic script — exposes window.acceptIncomingCall

window.acceptIncomingCall = async function acceptIncomingCall(callId, callerId, name, avatar, type) {
  stopRingtone(); dismissIncomingCallBanner();
  if (window._incomingCallTimeout) clearTimeout(window._incomingCallTimeout);
  if (type === 'group') {
    const { data: activeSession } = await db.from('group_call_sessions')
      .select('id, conversation_id, call_type').eq('status', 'active')
      .order('started_at', { ascending: false }).limit(1).maybeSingle();
    if (activeSession) {
      try { await db.from('calls').update({ status: 'active' }).eq('id', callId); } catch(e) {}
      await joinGroupCall(activeSession.id, activeSession.conversation_id, activeSession.call_type);
    } else {
      toast('Group call already khatam ho chuki hai');
    }
    return;
  }
  try { await db.from('calls').update({ status: 'active' }).eq('id', callId); } catch(e) {}
  _callState.active = true; _callState.callId = callId; _callState.callType = type; _callState.isOutgoing = false; _callState.remoteUserId = callerId; _callState.remoteUserName = name; _callState.remoteUserAvatar = avatar; _callState.startTime = Date.now();
  showCallScreen(); await setupLocalMedia(); await setupWebRTCCallee(callId, callerId);
};
