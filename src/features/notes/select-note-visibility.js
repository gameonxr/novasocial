// Note visibility UI state helper; note persistence and music remain inline.
function selectNoteVisibility(v){
  window._noteVisibility = v;
  ['everyone','followers','close_friends'].forEach(vv=>{
    const el = document.getElementById('note-vis-'+vv);
    if(el){
      el.style.background = vv===v ? 'rgba(255,255,255,0.12)' : 'transparent';
      el.style.color = vv===v ? '#fff' : '#666';
      el.style.borderColor = vv===v ? 'rgba(255,255,255,0.18)' : '#1a1a1a';
    }
  });
}
