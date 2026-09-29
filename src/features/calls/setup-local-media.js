// setupLocalMedia — extracted from index.html
// Owner SHA-256: 92d69bd9fe12f4066e2acb32f1402d286a2bff65dee278d6f5610844c0bc6031
// Classic script — exposes window.setupLocalMedia

window.setupLocalMedia = async function setupLocalMedia() {
  try {
    const constraints = { audio: true, video: _callState.callType === 'video' ? { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' } : false };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    _callState.localStream = stream;

    if (_callState.callType === 'video') {
      // ── RELIABLE ASSIGNMENT: element milne tak retry karo ──
      await _attachLocalVideoStream(stream);
    }
    return stream;
  } catch(e) {
    if (e.name === 'NotAllowedError') toast('Microphone/Camera permission denied. Settings mein allow karo.');
    else toast('Media access failed: ' + e.message);
    endCall(); return null;
  }
};
