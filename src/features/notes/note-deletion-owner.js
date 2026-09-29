'use strict';

window.deleteMyNote = async function(){
  if(!_myActiveNote) return;
  try {
    // Capture music_artwork URL before delete (agar koi cached hai)
    const oldArtwork = _myActiveNote.music_artwork || null;
    await db.from('quick_notes').delete().eq('id', _myActiveNote.id);
    // Cleanup music artwork if it was a Cloudinary-hosted asset (rare but possible)
    if(oldArtwork && oldArtwork.includes('cloudinary.com')) {
      await deleteMediaProduction(oldArtwork, 'note', 'user_delete');
    }
    toast('Note removed');
  } catch(e) {
    console.error('Note delete error:', e);
    toast('❌ Note delete failed');
  }
  closeModal();
  loadNotesBar();
};
