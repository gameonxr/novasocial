// Note-music preview controller; state declarations remain inline.
function togglePreviewPlay(idx, url){
  if(!url){ toast('Preview available nahi hai is gaane ka'); return; }
  if(_previewPlayingIdx === idx && _previewAudio && !_previewAudio.paused){
    _previewAudio.pause();
    resetPreviewIcon(idx);
    _previewPlayingIdx = null;
    return;
  }
  if(_previewAudio){ _previewAudio.pause(); if(_previewPlayingIdx!==null) resetPreviewIcon(_previewPlayingIdx); }
  _previewAudio = new Audio(url);
  _previewAudio.play().catch(()=>toast('Preview play nahi hua'));
  _previewPlayingIdx = idx;
  const icon = document.getElementById('preview-icon-'+idx);
  if(icon) icon.innerHTML = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
  _previewAudio.onended = ()=>{ resetPreviewIcon(idx); _previewPlayingIdx=null; };
}
