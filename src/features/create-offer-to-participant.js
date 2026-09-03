// createOfferToParticipant — extracted from index.html
// Owner SHA-256: 91308bd5d99e553cf35c9ffc51b2fb188d640c5e53ee5ca3adf3eaf8fcf00e00
// Classic script — exposes window.createOfferToParticipant

window.createOfferToParticipant = async function createOfferToParticipant(sessionId, targetUserId, targetProfile) {
  const peer = createGroupPeerConnection(sessionId, targetUserId, targetProfile);
  try {
    const offer = await peer.createOffer({
      offerToReceiveAudio: true, offerToReceiveVideo: _groupCallState.callType === 'video'
    });
    await peer.setLocalDescription(offer);
    await db.from('call_signals').insert({
      group_session_id: sessionId, sender_id: ME.id, target_id: targetUserId,
      signal_type: 'offer', signal_data: JSON.stringify(offer)
    });
  } catch(e) { console.error('Offer to', targetUserId, 'failed:', e); }
};
