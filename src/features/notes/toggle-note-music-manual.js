// Note-viewer manual music toggle.
function toggleNoteMusicManual(url, startSec){
  if(_noteViewAudio && !_noteViewAudio.paused){
    _noteViewAudio.pause();
    updateNoteMusicIcon(false);
    return;
  }
  autoPlayNoteMusic(url, startSec);
}
