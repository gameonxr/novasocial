// adminHardDeletePost — extracted from index.html
// Owner SHA-256: 1710e58b8191cae98b27d8567efe044fb918ef462034930e654744d558184b7b
// Classic script — exposes window.adminHardDeletePost

window.adminHardDeletePost = async function adminHardDeletePost(postId, userId, reason = '') {
  try {
    // ── STEP 1: Media fetch karo pehle (before delete) ──
    const { data: post, error: fetchErr } = await db
      .from('posts')
      .select('media_url, media_type, thumbnail_url')
      .eq('id', postId)
      .maybeSingle();

    if(fetchErr) console.warn('Post fetch error (continuing):', fetchErr);

    // ── STEP 2: Related data delete ──
    await Promise.allSettled([
      db.from('likes').delete().eq('post_id', postId),
      db.from('comments').delete().eq('post_id', postId),
      db.from('bookmarks').delete().eq('post_id', postId),
      db.from('post_views').delete().eq('post_id', postId),
      db.from('notifications').delete().eq('post_id', postId),
    ]);

    // ── STEP 3: Post row delete ──
    const { error: delErr } = await db.from('posts').delete().eq('id', postId);
    if(delErr) throw delErr;

    // ── STEP 4: Cloudinary media delete (production engine) ──
    if(post) {
      const urls = [post.media_url, post.thumbnail_url].filter(Boolean);
      if(urls.length) {
        await deleteMultipleMediaProduction(
          urls,
          post.media_type === 'video' ? 'reel' : 'post',
          'admin_hard_delete'
        );
      }
    }

    // ── STEP 5: Audit log ──
    await logAdminAction('hard_delete_post', postId, 'post',
      `Permanent delete — all data and media removed. Reason: ${reason || 'N/A'}`);

    // ── STEP 6: Notify owner (optional) ──
    if(userId) {
      try {
        await sendAdminNotification(userId,
          `🗑️ Aapka post permanently delete kar diya gaya hai. Reason: ${reason || 'Community guidelines violation'}`);
      } catch(e) {}
    }

    toast('✅ Post permanently deleted from everywhere');
    return true;
  } catch(e) {
    console.error('Admin hard delete error:', e);
    toast('❌ Delete failed: ' + (e.message || 'unknown'));
    return false;
  }
};
