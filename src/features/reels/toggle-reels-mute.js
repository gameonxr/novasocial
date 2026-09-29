// Reels mute UI toggle; the protected Reels renderer remains inline.
function toggleReelsMute(){
  reelsMuted=!reelsMuted;
  // Sirf current reel ka sound change karo, baaki sab muted rahenge
  const v = document.getElementById('rv-' + currentReelIdx);
  if(v) {
    v.muted = reelsMuted;
    if(!reelsMuted) v.play().catch(()=>{});
  }
  document.querySelectorAll('.mute-icon').forEach(el=>{el.innerHTML=reelsMuted?ico('mute','#fff',20):ico('unmute','#fff',20);});
  toast(reelsMuted?'🔇 Muted':'🔊 Sound On');
}
