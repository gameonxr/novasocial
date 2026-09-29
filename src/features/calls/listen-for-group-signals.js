// listenForGroupSignals — extracted from index.html
// Owner SHA-256: e6896513fb9a078357f8a49fccf39bd50bda74bc22d014039c5f94937a614b6f
// Classic script — exposes window.listenForGroupSignals

window.listenForGroupSignals = function listenForGroupSignals(sessionId) {
  if (_groupCallState.signalsSub) db.removeChannel(_groupCallState.signalsSub);
  _groupCallState.signalsSub = db.channel('group-signals-' + sessionId)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'call_signals',
      filter: `group_session_id=eq.${sessionId}` },
      async (payload) => {
        const sig = payload.new;
        if (sig.sender_id === ME.id || (sig.target_id !== null && sig.target_id !== ME.id)) return;
        try {
          const data = JSON.parse(sig.signal_data);
          let peer = _groupCallState.peers[sig.sender_id];

          if (sig.signal_type === 'offer') {
            if (!peer) {
              const { data: senderProf } = await db.from('profiles').select('username,avatar_url').eq('id', sig.sender_id).single();
              peer = createGroupPeerConnection(sessionId, sig.sender_id, senderProf);
            }
            await peer.setRemoteDescription(new RTCSessionDescription(data));
            const answer = await peer.createAnswer();
            await peer.setLocalDescription(answer);
            await db.from('call_signals').insert({
              group_session_id: sessionId, sender_id: ME.id, target_id: sig.sender_id,
              signal_type: 'answer', signal_data: JSON.stringify(answer)
            });
          } else if (sig.signal_type === 'answer') {
            if (peer && peer.signalingState === 'have-local-offer') {
              await peer.setRemoteDescription(new RTCSessionDescription(data));
            }
          } else if (sig.signal_type === 'ice-candidate') {
            if (peer && peer.remoteDescription) {
              await peer.addIceCandidate(new RTCIceCandidate(data));
            }
          } else if (sig.signal_type === 'leave') {
            removeRemoteTile(sig.sender_id);
            if (peer) { peer.close(); delete _groupCallState.peers[sig.sender_id]; }
          }
        } catch(e) { console.error('Group signal error:', e); }
      }
    ).subscribe();
};
