// setupWebRTCCallee — extracted from index.html
// Owner SHA-256: e894d5d966d195fb2a686495025aa4fb348553bd05f917dd0e1ba3a61b909c42
// Classic script — exposes window.setupWebRTCCallee

window.setupWebRTCCallee = async function setupWebRTCCallee(callId, callerId) {
  const peer = createPeerConnection(callId, callerId); updateCallStatus('Connecting...'); listenForSignals(callId);
  try {
    const { data: signals } = await db.from('call_signals').select('*').eq('call_id', callId).eq('signal_type', 'offer').order('created_at', { ascending: true }).limit(1);
    if (signals && signals.length > 0 && peer.signalingState === 'stable') {
      const offer = JSON.parse(signals[0].signal_data); await peer.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peer.createAnswer(); await peer.setLocalDescription(answer);
      await db.from('call_signals').insert({ call_id: callId, sender_id: ME.id, signal_type: 'answer', signal_data: JSON.stringify(answer) });
      if (window._pendingIceCandidates?.length) { for (const c of window._pendingIceCandidates) { try { await peer.addIceCandidate(new RTCIceCandidate(c)); } catch(e) {} } window._pendingIceCandidates = []; }
    }
  } catch(e) { console.log('Callee setup error:', e); }
  listenForCallStatus(callId);
};
