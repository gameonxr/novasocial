// Segment-picker confirmation helper; persistence remains delegated.
function confirmMusicSegment(title, artist, artwork, previewUrl){
  if(_segmentAudio){ _segmentAudio.pause(); _segmentAudio=null; }
  window._noteMusic = {title, artist, artwork, previewUrl, startSec: window._segmentStartSec||0};
  document.getElementById('music-segment-panel')?.remove();
  renderNoteMusicSection();
  saveRecentMusic(title, artist, artwork, previewUrl);
}
