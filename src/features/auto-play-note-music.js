// Note-viewer music autoplay controller.
function autoPlayNoteMusic(url, startSec){
  if(_noteViewAudio){ _noteViewAudio.pause(); _noteViewAudio=null; }
  _noteViewAudio = new Audio(url);
  _noteViewAudio.preload = 'auto';

  const doPlay = () => {
    try{ _noteViewAudio.currentTime = startSec||0; }catch(e){}
    _noteViewAudio.play().catch(()=>{ /* autoplay policy block ho sakta hai, manual tap se chalega */ });
    updateNoteMusicIcon(true);
  };

  if(_noteViewAudio.readyState >= 1){
    doPlay(); // metadata already load ho chuki (cached audio)
  } else {
    _noteViewAudio.addEventListener('loadedmetadata', doPlay, {once:true});
  }

  _noteViewAudio.addEventListener('timeupdate', function(){
    if(_noteViewAudio.currentTime >= _noteViewAudio.duration - 0.15){
      _noteViewAudio.currentTime = startSec||0;
      _noteViewAudio.play().catch(()=>{});
    }
  });
}
