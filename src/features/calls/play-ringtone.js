// playRingtone — extracted from index.html
// Owner SHA-256: 7717c2d8c47f4ebbd4fb05549786f81c7a4ed467675898af94303fd7d701accc
// Classic script — exposes window.playRingtone

window.playRingtone = function playRingtone() {
  stopRingtone();
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)(); window._ringtoneCtx = ctx;
    let startTime = ctx.currentTime;
    const playBeep = (when) => { const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.connect(gain); gain.connect(ctx.destination); osc.frequency.value = 440; osc.type = 'sine'; gain.gain.setValueAtTime(0.3, when); gain.gain.exponentialRampToValueAtTime(0.001, when + 0.5); osc.start(when); osc.stop(when + 0.5); };
    for (let i = 0; i < 5; i++) { playBeep(startTime + i * 1.2); playBeep(startTime + i * 1.2 + 0.6); }
    setTimeout(stopRingtone, 6200);
  } catch(e) {}
};
