// createGroupPeerConnection — extracted from index.html
// Owner SHA-256: 48bcc9464ba533eb84c87f33ccc6c25473d43b7cd75c801d7f80051c251e3973
// Classic script — exposes window.createGroupPeerConnection

window.createGroupPeerConnection = function createGroupPeerConnection(sessionId, remoteUserId, remoteProfile) {
  const config = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'turn:standard.relay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' },
      { urls: 'turn:standard.relay.metered.ca:443', username: 'openrelayproject', credential: 'openrelayproject' }
    ]
  };
  const peer = new RTCPeerConnection(config);
  _groupCallState.peers[remoteUserId] = peer;

  if (_groupCallState.localStream) {
    _groupCallState.localStream.getTracks().forEach(t => peer.addTrack(t, _groupCallState.localStream));
  }

  peer.ontrack = (event) => {
    addRemoteTileToGrid(remoteUserId, remoteProfile, event.streams[0]);
    setupSpeakingIndicator(remoteUserId, event.streams[0]);
  };

  peer.onicecandidate = async (event) => {
    if (event.candidate) {
      try {
        await db.from('call_signals').insert({
          group_session_id: sessionId, sender_id: ME.id, target_id: remoteUserId,
          signal_type: 'ice-candidate', signal_data: JSON.stringify(event.candidate)
        });
      } catch(e) {}
    }
  };

  peer.onconnectionstatechange = () => {
    if (peer.connectionState === 'failed' || peer.connectionState === 'closed') {
      removeRemoteTile(remoteUserId);
      delete _groupCallState.peers[remoteUserId];
    }
  };

  return peer;
};
