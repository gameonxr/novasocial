// Expired quick-note cleanup controller.
async function cleanupExpiredNotes() {
  if(window._expiredNotesCleaned) return;
  window._expiredNotesCleaned = true;

  try {
    const { data: expired } = await db
      .from('quick_notes')
      .select('id, music_artwork')
      .lt('expires_at', new Date().toISOString())
      .limit(100);

    if(!expired?.length) return;

    console.log(`🧹 ${expired.length} expired notes found`);

    // Media cleanup (only Cloudinary-hosted artwork)
    const mediaUrls = expired
      .map(n => n.music_artwork)
      .filter(url => url && url.includes('cloudinary.com'));
    if(mediaUrls.length) {
      await deleteMultipleMediaProduction(mediaUrls, 'note', 'expired_story');
    }

    // Related data cleanup
    const ids = expired.map(n => n.id);
    await Promise.allSettled([
      db.from('quick_note_views').delete().in('note_id', ids),
      db.from('quick_note_reactions').delete().in('note_id', ids),
    ]);

    // Notes delete
    await db.from('quick_notes').delete().in('id', ids);

    console.log(`✅ ${expired.length} expired notes cleaned up`);
  } catch(e) {
    console.error('Notes cleanup error (non-critical):', e);
  }
}
