// setupWebRTCCaller — extracted from index.html
// Owner SHA-256: 6b8e6f1529c63a4c18fd2d77fb60ab2a84a0a9a27df1db1f2d24915e79810bad
// Classic script — exposes window.setupWebRTCCaller

window.setupWebRTCCaller = async function setupWebRTCCaller(callId, calleeId) {
  const peer = createPeerConnection(callId, calleeId);
  try {
    const offer = await peer.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: _callState.callType === 'video' });
    await peer.setLocalDescription(offer);
    await db.from('call_signals').insert({ call_id: callId, sender_id: ME.id, signal_type: 'offer', signal_data: JSON.stringify(offer) });
  } catch(e) { toast('Call setup failed: ' + e.message); endCall(); return; }
  updateCallStatus('Ringing...'); listenForSignals(callId); listenForCallStatus(callId);
};
