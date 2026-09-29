// deleteStory — extracted from index.html
// Owner SHA-256: f890447f730f280e6f7d65c045e168e98fb0deecaec2cba65e42eddf99fa4112
// Classic script — exposes window.deleteStory

window.deleteStory = async function deleteStory(storyId) {
  if(!confirm('Story delete karo?')) return;

  try {
    // ── STEP 1: Story data fetch karo ──
    const { data: story, error: fetchErr } = await db
      .from('stories')
      .select('media_url, user_id')
      .eq('id', storyId)
      .single();

    if(fetchErr || !story) {
      toast('❌ Story delete nahi ho saki');
      return;
    }

    // Ownership verify
    if(story.user_id !== ME.id) {
      toast('❌ Ye tumhari story nahi hai');
      return;
    }

    // ── STEP 2: Related data cleanup (non-blocking, all settle) ──
    await Promise.allSettled([
      db.from('story_views').delete().eq('story_id', storyId),
      // story_reactions table may not exist — try/catch wrapper
      (async () => {
        try { await db.from('story_reactions').delete().eq('story_id', storyId); }
        catch(e) { /* table may not exist, non-critical */ }
      })(),
      db.from('story_poll_votes').delete().eq('story_id', storyId),
    ]);

    // ── STEP 3: Story row delete ──
    await db.from('stories')
      .delete()
      .eq('id', storyId)
      .eq('user_id', ME.id);

    // ── STEP 4: Cloudinary cleanup (production engine) ──
    if(story.media_url) {
      await deleteMediaProduction(story.media_url, 'story', 'user_delete');
    }

    toast('✅ Story deleted');
    closeModal();
    closeSV();
    // Invalidate home cache (stories bar wapas fresh load ho)
    invalidateTabCache('home');
    go('home');

  } catch(e) {
    console.error('Story delete error:', e);
    toast('❌ Story delete failed');
  }
};
