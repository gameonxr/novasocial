// cleanupExpiredStories — extracted from index.html
// Owner SHA-256: 5ff35b2ccd37a0a4ca199a058573f8124f91b0b9860d1d2f009db1cf879e712b
// Classic script — exposes window.cleanupExpiredStories

window.cleanupExpiredStories = async function cleanupExpiredStories() {
  // Session-once flag — multiple open()/close() pe baar baar na chale
  if(window._expiredStoriesCleaned) return;
  window._expiredStoriesCleaned = true;

  try {
    const { data: expired } = await db
      .from('stories')
      .select('id, media_url')
      .lt('expires_at', new Date().toISOString())
      .limit(100);

    if(!expired?.length) return;

    console.log(`🧹 ${expired.length} expired stories found`);

    // ── STEP 1: Media cleanup queue (batch) ──
    const mediaUrls = expired.map(s => s.media_url).filter(Boolean);
    if(mediaUrls.length) {
      await deleteMultipleMediaProduction(mediaUrls, 'story', 'expired_story');
    }

    // ── STEP 2: Related data cleanup ──
    const ids = expired.map(s => s.id);
    await Promise.allSettled([
      db.from('story_views').delete().in('story_id', ids),
      // story_reactions may not exist
      (async () => {
        try { await db.from('story_reactions').delete().in('story_id', ids); }
        catch(e) {}
      })(),
      db.from('story_poll_votes').delete().in('story_id', ids),
    ]);

    // ── STEP 3: Stories delete ──
    await db.from('stories').delete().in('id', ids);

    console.log(`✅ ${expired.length} expired stories cleaned up`);
  } catch(e) {
    console.error('Story cleanup error (non-critical):', e);
  }
};
