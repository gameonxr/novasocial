// Note creator refresh helper.
async function refreshAndOpenNoteCreator(){
  const{data:latestNote} = await db.from('quick_notes').select('*').eq('user_id',ME.id).gt('expires_at',new Date().toISOString()).order('created_at',{ascending:false}).limit(1).maybeSingle();
  console.log('%c[NOTE] refreshAndOpenNoteCreator | latestNote=', 'color:magenta;font-weight:bold', latestNote);
  _myActiveNote = latestNote;
  setTimeout(()=>{ openNoteCreator(); }, 200);
}
