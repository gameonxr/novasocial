// Segment-picker preview audio controller.
function toggleSegmentPreview(url){
  const icon = document.getElementById('segment-play-icon');
  if(_segmentAudio && !_segmentAudio.paused){
    _segmentAudio.pause();
    icon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"/>';
    return;
  }
  if(!_segmentAudio) _segmentAudio = new Audio(url);
  _segmentAudio.currentTime = window._segmentStartSec || 0;
  _segmentAudio.play().catch(()=>toast('Play failed'));
  icon.innerHTML = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
  _segmentAudio.onended = ()=>{ icon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"/>'; };
}
