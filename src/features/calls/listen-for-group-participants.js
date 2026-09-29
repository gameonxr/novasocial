// listenForGroupParticipants — extracted from index.html
// Owner SHA-256: 66946ee31984e5c1772fd65e8a41fff22ee822cf7e2244bc699e9a056c97795c
// Classic script — exposes window.listenForGroupParticipants

window.listenForGroupParticipants = function listenForGroupParticipants(sessionId, conversationId) {
  if (_groupCallState.participantsSub) db.removeChannel(_groupCallState.participantsSub);
  _groupCallState.participantsSub = db.channel('group-participants-' + sessionId)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'group_call_participants',
      filter: `session_id=eq.${sessionId}` },
      (payload) => {
        if (payload.eventType === 'UPDATE' && payload.new.left_at) {
          removeRemoteTile(payload.new.user_id);
        }
        updateParticipantCount();
      }
    ).subscribe();
};
