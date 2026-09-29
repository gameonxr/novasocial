// cleanupExpiredStoryMedia — extracted from index.html
// Owner SHA-256: 369f199fb442975d897d7bd38a2fc62954529dac172c0b2149bab66c314a6821
// Classic script — exposes window.cleanupExpiredStoryMedia

window.cleanupExpiredStoryMedia = async function cleanupExpiredStoryMedia() {
  // Sirf ek baar per session
  if(window._storiesCleanedUp) return;
  window._storiesCleanedUp = true;

  try {
    // Expired stories dhundo jo abhi bhi Cloudinary media rakhti hain
    const { data: expiredStories } = await db
      .from('stories')
      .select('id, media_url, user_id')
      .lt('expires_at', new Date().toISOString())
      .not('media_url', 'is', null)
      .like('media_url', '%cloudinary%')
      .limit(50); // Ek baar mein max 50

    if(!expiredStories?.length) return;

    console.log(`🧹 Found ${expiredStories.length} expired stories to cleanup`);

    // Media delete queue mein daalo
    for(const story of expiredStories) {
      if(story.media_url) {
        await deleteCloudinaryMedia(story.media_url);
      }
    }

    // Expired stories Supabase se bhi delete karo
    const expiredIds = expiredStories.map(s => s.id);
    await db.from('stories')
      .delete()
      .in('id', expiredIds);

    console.log(`✅ Cleaned up ${expiredStories.length} expired stories`);
  } catch(e) {
    console.log('Story cleanup failed silently:', e);
  }
};
