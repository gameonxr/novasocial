// _flushPendingIceCandidates — extracted from index.html
// Owner SHA-256: 4ad4d2323b44c506d4ffb20319d9643705cbaa4bbcf5aeb1ff4b6c4c469bd169
// Classic script — exposes window._flushPendingIceCandidates

window._flushPendingIceCandidates = async function _flushPendingIceCandidates(peer) {
  if (!window._pendingIceCandidates || !window._pendingIceCandidates.length) return;

  console.log(`[CALL] Flushing ${window._pendingIceCandidates.length} pending ICE candidates`);

  const candidates = [...window._pendingIceCandidates];
  window._pendingIceCandidates = [];

  for (const candidateData of candidates) {
    try {
      await peer.addIceCandidate(new RTCIceCandidate(candidateData));
    } catch(e) {
      console.log('[CALL] Failed to add queued ICE candidate:', e.message);
    }
  }
};
