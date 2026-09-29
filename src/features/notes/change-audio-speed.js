// Extracted from index.html during Phase 74.
function changeAudioSpeed(btn) {
  const audio = btn.previousElementSibling;
  if(!audio) return;
  if(audio.playbackRate === 1) { audio.playbackRate = 1.5; btn.textContent = '1.5x'; }
  else if(audio.playbackRate === 1.5) { audio.playbackRate = 2; btn.textContent = '2x'; }
  else { audio.playbackRate = 1; btn.textContent = '1x'; }
  toast('Speed: ' + btn.textContent);
}
