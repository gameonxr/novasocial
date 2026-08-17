// Preview-audio cleanup helper; playback state declarations remain inline.
function stopAllPreviewAudio(){
  if(_previewAudio){ _previewAudio.pause(); _previewAudio=null; }
  _previewPlayingIdx = null;
}
