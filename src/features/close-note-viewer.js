// Note-viewer overlay/audio cleanup.
function closeNoteViewer(){
  if(_noteViewAudio){ _noteViewAudio.pause(); _noteViewAudio=null; }
  const overlay = document.getElementById('note-view-overlay');
  if(overlay){
    overlay.style.transition = 'opacity 0.2s ease';
    overlay.style.opacity = '0';
    setTimeout(()=>overlay.remove(), 200);
  }
}
