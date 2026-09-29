// createPeerConnection — extracted from index.html
// Owner SHA-256: 88f56ec0db37ac6aca13c449de82122b5a443f3d392235b135ef5d2d29fcaacb
// Classic script — exposes window.createPeerConnection

window.createPeerConnection = function createPeerConnection(callId, remoteUserId) {
  const config = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }, { urls: 'turn:standard.relay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' }, { urls: 'turn:standard.relay.metered.ca:443', username: 'openrelayproject', credential: 'openrelayproject' }] };
  const peer = new RTCPeerConnection(config); _callState.peer = peer; window._pendingIceCandidates = [];
  if (_callState.localStream) { _callState.localStream.getTracks().forEach(track => peer.addTrack(track, _callState.localStream)); }
  peer.ontrack = (event) => {
    _callState.remoteStream = event.streams[0];
    const remoteAudio = document.getElementById('nova-call-remote-audio'); const remoteVideo = document.getElementById('nova-call-remote-video');
    if (remoteAudio) { remoteAudio.srcObject = event.streams[0]; remoteAudio.play().catch(() => {}); }
    if (remoteVideo && _callState.callType === 'video') { remoteVideo.srcObject = event.streams[0]; remoteVideo.play().catch(() => {}); }

    // ── NAYA: Video track mile toh center avatar hide karo, compact badge dikhao ──
    if (event.track.kind === 'video' && _callState.callType === 'video') {
      const centerInfo = document.getElementById('nova-call-center-info');
      const compactBadge = document.getElementById('nova-call-compact-badge');
      if (centerInfo) {
        centerInfo.style.opacity = '0';
        setTimeout(() => { centerInfo.style.display = 'none'; }, 300);
      }
      if (compactBadge) {
        compactBadge.style.display = 'flex';
      }
    }

    startCallTimer(); updateCallStatus('Connected');
  };
  peer.onicecandidate = async (event) => { if (event.candidate) { try { await db.from('call_signals').insert({ call_id: callId, sender_id: ME.id, signal_type: 'ice-candidate', signal_data: JSON.stringify(event.candidate) }); } catch(e) {} } };
  peer.onconnectionstatechange = () => {
    console.log('%c[CALL] connectionState changed to: ' + peer.connectionState, 'color:orange;font-weight:bold');

    if (peer.connectionState === 'connected') {
      // Connection successful — reconnect timer clear karo agar chal raha tha
      if(window._callReconnectTimeout) { clearTimeout(window._callReconnectTimeout); window._callReconnectTimeout = null; }
      updateCallStatus('Connected');
    }

    if (peer.connectionState === 'failed' || peer.connectionState === 'disconnected') {
      toast('Connection lost. Reconnecting...');
      updateCallStatus('Reconnecting...');

      // 8 second baad bhi connect nahi hua toh call end karo (bad network)
      if(!window._callReconnectTimeout) {
        window._callReconnectTimeout = setTimeout(() => {
          if(_callState.active && peer.connectionState !== 'connected') {
            toast('Connection nahi ban saka. Call end ho rahi hai.');
            endCall();
          }
        }, 8000);
      }
    }

    if (peer.connectionState === 'closed') endCall();
  };
  return peer;
};
