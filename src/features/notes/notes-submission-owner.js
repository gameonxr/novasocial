window.submitNote = async function submitNote(){
  const text = document.getElementById('note-text-inp')?.value?.trim();
  console.log('%c[NOTE] submitNote called | text="'+text+'" | _myActiveNote=', 'color:cyan;font-weight:bold', _myActiveNote);
  if(!text && !window._noteMusic){ toast('Text likho ya gaana lagao'); return; }
  try{
    if(_myActiveNote){
      console.log('%c[NOTE] Taking UPDATE path for id='+_myActiveNote.id, 'color:orange');
      const{data,error} = await db.from('quick_notes').update({
        text: text || '',
        music_title: window._noteMusic?.title||null, music_artist: window._noteMusic?.artist||null,
        music_artwork: window._noteMusic?.artwork || null,
        music_preview_url: window._noteMusic?.previewUrl || null,
        music_start_sec: window._noteMusic?.startSec || 0,
        visibility: window._noteVisibility,
        expires_at: new Date(Date.now()+24*60*60*1000).toISOString()
      }).eq('id', _myActiveNote.id).select();
      console.log('%c[NOTE] Update result:', 'color:orange', data, 'error:', error);
      if(error) throw error;
    } else {
      console.log('%c[NOTE] Taking INSERT path (no active note found)', 'color:lime');
      const{data,error} = await db.from('quick_notes').insert({
        user_id: ME.id, text: text || '',
        music_title: window._noteMusic?.title||null, music_artist: window._noteMusic?.artist||null,
        music_artwork: window._noteMusic?.artwork || null,
        music_preview_url: window._noteMusic?.previewUrl || null,
        music_start_sec: window._noteMusic?.startSec || 0,
        visibility: window._noteVisibility
      }).select();
      console.log('%c[NOTE] Insert result:', 'color:lime', data, 'error:', error);
      if(error) throw error;
    }
    toast('Note shared! ✨');
    closeModal();
    loadNotesBar();
  }catch(e){ console.log('%c[NOTE] CAUGHT ERROR:', 'color:red;font-weight:bold', e); toast('Failed: '+e.message); }
};
