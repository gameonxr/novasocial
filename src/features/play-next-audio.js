// Isolated audio auto-play helper extracted from index.html.
function playNextAudio(audioEl) {
  const allAudios = document.querySelectorAll('audio');
  for(let i=0; i<allAudios.length; i++) {
    if(allAudios[i] === audioEl && i+1 < allAudios.length) {
      allAudios[i+1].play();
      break;
    }
  }
}
