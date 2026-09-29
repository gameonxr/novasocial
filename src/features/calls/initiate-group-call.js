// initiateGroupCall — extracted from index.html
// Owner SHA-256: 6672902220f05503b81d0a49cd201212e95349c2f4b4696df69df2926f803beb
// Classic script — exposes window.initiateGroupCall

window.initiateGroupCall = async function initiateGroupCall(conversationId, callType = 'audio') {
  if (_callState.active || _groupCallState.active) { toast('Pehle current call khatam karo'); return; }

  const { data: members } = await db.from('conversation_members')
    .select('user_id, profiles(username, avatar_url)')
    .eq('conversation_id', conversationId).neq('user_id', ME.id);

  if (!members || members.length === 0) { toast('Group mein koi nahi hai'); return; }
  if (members.length > _groupCallState.MAX_PARTICIPANTS - 1) {
    toast(`Group calls max ${_groupCallState.MAX_PARTICIPANTS} logo ke liye hain`);
  }

  let sessionId;
  try {
    const { data: session, error } = await db.from('group_call_sessions').insert({
      conversation_id: conversationId, started_by: ME.id, call_type: callType, status: 'active'
    }).select().single();
    if (error) throw error;
    sessionId = session.id;
  } catch(e) { toast('Group call start nahi hui: ' + e.message); return; }

  const callInserts = members.map(m => ({
    caller_id: ME.id, callee_id: m.user_id, conversation_id: conversationId,
    call_type: 'group', status: 'ringing'
  }));
  try { await db.from('calls').insert(callInserts); } catch(e) {}

  await joinGroupCall(sessionId, conversationId, callType);
};
