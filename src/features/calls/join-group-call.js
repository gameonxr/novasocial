// joinGroupCall — extracted from index.html
// Owner SHA-256: 341ab188f96911d1572323ea1ecb3a9ecb291d80b7acc1ac5a74d667c0d9ce03
// Classic script — exposes window.joinGroupCall

window.joinGroupCall = async function joinGroupCall(sessionId, conversationId, callType) {
  _groupCallState.active = true;
  _groupCallState.sessionId = sessionId;
  _groupCallState.conversationId = conversationId;
  _groupCallState.callType = callType;
  _groupCallState.peers = {};

  showGroupCallScreen();

  try {
    const constraints = { audio: true, video: callType === 'video' ? { width:{ideal:640}, height:{ideal:480}, facingMode:'user' } : false };
    _groupCallState.localStream = await navigator.mediaDevices.getUserMedia(constraints);
    addLocalTileToGrid();
  } catch(e) { toast('Media access failed: ' + e.message); leaveGroupCall(); return; }

  const { data: existing } = await db.from('group_call_participants')
    .select('user_id, profiles(username, avatar_url)')
    .eq('session_id', sessionId).is('left_at', null);

  await db.from('group_call_participants').upsert({
    session_id: sessionId, user_id: ME.id, is_muted: false, is_video_off: false, left_at: null
  }, { onConflict: 'session_id,user_id' });

  listenForGroupSignals(sessionId);
  listenForGroupParticipants(sessionId, conversationId);

  for (const p of (existing || [])) {
    if (p.user_id === ME.id) continue;
    await createOfferToParticipant(sessionId, p.user_id, p.profiles);
  }
};
