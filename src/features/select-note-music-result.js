// Note-music selection helper; recents and segment picker remain inline.
function selectNoteMusicResult(title, artist, artwork, previewUrl){
  stopAllPreviewAudio();
  if(!previewUrl){
    // Preview nahi hai to seedha attach karo bina segment-picker ke
    window._noteMusic = {title, artist, artwork, previewUrl:'', startSec:0};
    document.getElementById('music-search-panel')?.remove();
    renderNoteMusicSection();
    saveRecentMusic(title, artist, artwork);
    return;
  }
  showMusicSegmentPicker(title, artist, artwork, previewUrl);
}
