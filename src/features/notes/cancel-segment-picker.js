// Segment-picker cancellation and cleanup helper.
function cancelSegmentPicker(){
  if(_segmentAudio){ _segmentAudio.pause(); _segmentAudio=null; }
  document.getElementById('music-segment-panel')?.remove();
}
