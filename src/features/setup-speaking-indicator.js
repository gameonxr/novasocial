// setupSpeakingIndicator — extracted from index.html
// Owner SHA-256: cc777fdf9263fa7bff2a0bad6a8c7aec54a7b4976b1743502bbe2b8bfceed2a6
// Classic script — exposes window.setupSpeakingIndicator

window.setupSpeakingIndicator = function setupSpeakingIndicator(userId, stream) {
  try {
    const audioCtx = window._gcAudioCtx || (window._gcAudioCtx = new (window.AudioContext || window.webkitAudioContext)());
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    _groupCallState.audioAnalysers[userId] = analyser;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    function checkLevel() {
      if (!_groupCallState.audioAnalysers[userId]) return;
      analyser.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((a,b) => a+b, 0) / dataArray.length;
      const tile = document.getElementById('gc-tile-' + userId);
      if (tile) tile.style.boxShadow = avg > 20 ? '0 0 0 3px #3db83d' : 'none';
      requestAnimationFrame(checkLevel);
    }
    checkLevel();
  } catch(e) {}
};
