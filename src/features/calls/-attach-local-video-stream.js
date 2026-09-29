// _attachLocalVideoStream — extracted from index.html
// Owner SHA-256: 2cbd835f7f8588d135c14fe930de8e0eeb921ab4d0edba07ed220fbb5cc33cc9
// Classic script — exposes window._attachLocalVideoStream

window._attachLocalVideoStream = async function _attachLocalVideoStream(stream, attempt = 0) {
  const localVideo = document.getElementById('nova-call-local-video');

  if (!localVideo) {
    // Element abhi render nahi hua — thoda wait karke retry karo
    if (attempt < 10) {
      await new Promise(r => setTimeout(r, 100));
      return _attachLocalVideoStream(stream, attempt + 1);
    }
    console.warn('[CALL] Local video element nahi mila 10 attempts ke baad');
    return;
  }

  // Agar call ke beech mein user ne end kar diya, stream assign mat karo
  if (!_callState.active) return;

  localVideo.srcObject = stream;
  localVideo.muted = true;

  // Metadata load hone ka wait karo phir play karo — sabse reliable tarika
  const playWhenReady = () => {
    localVideo.play().catch((err) => {
      console.warn('[CALL] Local video autoplay blocked:', err.message);
      // Fallback: user interaction pe play karo
      document.getElementById('nova-call-screen')?.addEventListener('click', () => {
        localVideo.play().catch(() => {});
      }, { once: true });
    });
  };

  if (localVideo.readyState >= 1) {
    playWhenReady();
  } else {
    localVideo.onloadedmetadata = playWhenReady;
  }

  console.log('[CALL] Local video stream attached successfully');
};
