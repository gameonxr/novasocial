// switchCallCamera — extracted from index.html
// Owner SHA-256: 326e9fae722bcf17cc127b19e2103b4dcf80adb3af12c37c519ea61f697ef900
// Classic script — exposes window.switchCallCamera

window.switchCallCamera = async function switchCallCamera(){
  console.log('[CAMERA] switchCallCamera() called');

  if(_callState.callType !== 'video') {
    console.log('[CAMERA] Not a video call, ignoring');
    return;
  }
  if(!_callState.localStream){
    console.log('[CAMERA] localStream not ready yet');
    toast('Camera abhi ready ho raha hai, thoda ruko...');
    return;
  }

  const newMode = _callState.currentFacingMode === 'user' ? 'environment' : 'user';
  const localVideo = document.getElementById('nova-call-local-video');

  console.log('[CAMERA] Switching from', _callState.currentFacingMode, 'to', newMode);
  toast('Switching camera...');

  try {
    // ══════════════════════════════════════════════════
    // STEP 1: PURANI TRACK PEHLE STOP KARO
    // Camera hardware ko free karna ZAROORI hai naya stream
    // maangne se pehle, warna mobile devices pe fail hota hai
    // ══════════════════════════════════════════════════
    const oldVideoTrack = _callState.localStream.getVideoTracks()[0];
    if (oldVideoTrack) {
      console.log('[CAMERA] Stopping old track:', oldVideoTrack.label);
      oldVideoTrack.stop();
      _callState.localStream.removeTrack(oldVideoTrack);
    } else {
      console.warn('[CAMERA] No old video track found in localStream');
    }

    // Camera hardware release hone ke liye thoda wait karo
    await new Promise(resolve => setTimeout(resolve, 200));

    // ══════════════════════════════════════════════════
    // STEP 2: AB NAYA STREAM REQUEST KARO
    // Camera ab free hai, is liye ye reliably kaam karega
    // ══════════════════════════════════════════════════
    console.log('[CAMERA] Requesting new stream with facingMode:', newMode);

    let newStream;
    try {
      newStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: { exact: newMode } },
        audio: false
      });
    } catch(exactErr) {
      // Kuch devices 'exact' constraint support nahi karte — fallback try karo
      console.warn('[CAMERA] exact facingMode failed, trying ideal:', exactErr.message);
      newStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: newMode },
        audio: false
      });
    }

    const newVideoTrack = newStream.getVideoTracks()[0];
    if (!newVideoTrack) {
      throw new Error('Naya camera track nahi mila');
    }
    console.log('[CAMERA] New track obtained:', newVideoTrack.label);

    // ══════════════════════════════════════════════════
    // STEP 3: Naya track local stream mein add karo
    // ══════════════════════════════════════════════════
    _callState.localStream.addTrack(newVideoTrack);

    // ══════════════════════════════════════════════════
    // STEP 4: Remote peer ko naya track bhejo (seamless, call disconnect nahi hoti)
    // ══════════════════════════════════════════════════
    if (_callState.peer) {
      const senders = _callState.peer.getSenders();
      console.log('[CAMERA] Total senders on peer:', senders.length);
      const videoSender = senders.find(s => s.track && s.track.kind === 'video');

      if (videoSender) {
        console.log('[CAMERA] Replacing track on existing video sender');
        await videoSender.replaceTrack(newVideoTrack);
      } else {
        // Video sender nahi mila (shayad track null ho gaya tha) —
        // koi bhi video-capable sender dhundo
        const anySender = senders.find(s => s.track === null);
        if (anySender) {
          console.log('[CAMERA] Replacing track on null-track sender');
          await anySender.replaceTrack(newVideoTrack);
        } else {
          console.warn('[CAMERA] No suitable sender found for video track — adding as new track');
          _callState.peer.addTrack(newVideoTrack, _callState.localStream);
        }
      }
    } else {
      console.warn('[CAMERA] _callState.peer is null — peer connection missing');
    }

    // ══════════════════════════════════════════════════
    // STEP 5: Local preview video element ko reliably attach karo
    // ══════════════════════════════════════════════════
    if (localVideo) {
      localVideo.srcObject = null;
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    await _attachLocalVideoStream(_callState.localStream);

    _callState.currentFacingMode = newMode;
    toast(newMode === 'user' ? 'Front camera' : 'Back camera');
    console.log('[CAMERA] Switch completed successfully');

  } catch(e) {
    console.error('[CAMERA] Switch error:', e.name, '-', e.message);

    if (e.name === 'NotAllowedError') {
      toast('Camera permission denied');
    } else if (e.name === 'NotFoundError' || e.name === 'OverconstrainedError') {
      toast('Doosra camera is device pe available nahi hai');
    } else if (e.name === 'NotReadableError') {
      toast('Camera busy hai — dobara try karo');
    } else {
      toast('Camera switch failed: ' + (e.message || 'Try again'));
    }

    // ── Recovery: agar local stream mein koi video track hi nahi bacha ──
    if (_callState.localStream && _callState.localStream.getVideoTracks().length === 0) {
      console.log('[CAMERA] Attempting fallback recovery...');
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
        const fallbackTrack = fallbackStream.getVideoTracks()[0];
        if (fallbackTrack) {
          _callState.localStream.addTrack(fallbackTrack);
          if (_callState.peer) {
            const sender = _callState.peer.getSenders().find(s => s.track === null || (s.track && s.track.kind === 'video'));
            if (sender) await sender.replaceTrack(fallbackTrack);
          }
          await _attachLocalVideoStream(_callState.localStream);
          console.log('[CAMERA] Fallback recovery successful');
        }
      } catch(fallbackErr) {
        console.error('[CAMERA] Fallback recovery bhi fail hua:', fallbackErr.message);
        toast('Camera access poori tarah fail ho gaya — call end karke dobara try karo');
      }
    }
  }
};
