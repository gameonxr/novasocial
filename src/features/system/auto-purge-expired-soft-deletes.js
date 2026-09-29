// autoPurgeExpiredSoftDeletes — extracted from index.html
// Owner SHA-256: 89fb65bbef35a69ba4eca4eb06419616c8b1e76d82301c7ce6565c2ab30d7971
// Classic script — exposes window.autoPurgeExpiredSoftDeletes

window.autoPurgeExpiredSoftDeletes = async function autoPurgeExpiredSoftDeletes() {
  if(window._autoPurgeRunning) return;
  window._autoPurgeRunning = true;

  try {
    let toPurge = [];
    try {
      const { data, error } = await db.rpc('get_posts_to_purge');
      if(!error && data) toPurge = data;
    } catch(e) {
      // RPC may not exist yet — fallback to direct query
      try {
        const { data } = await db
          .from('posts')
          .select('id, media_url, media_type')
          .eq('is_deleted', true)
          .not('auto_purge_at', 'is', null)
          .lt('auto_purge_at', new Date().toISOString())
          .limit(50);
        toPurge = data || [];
      } catch(e2) { /* column may not exist yet */ }
    }

    if(!toPurge?.length) {
      window._autoPurgeRunning = false;
      return;
    }

    console.log(`🗑️ Auto-purging ${toPurge.length} expired soft-deletes`);

    for(const post of toPurge) {
      try {
        // Related data cleanup
        await Promise.allSettled([
          db.from('likes').delete().eq('post_id', post.id),
          db.from('comments').delete().eq('post_id', post.id),
          db.from('bookmarks').delete().eq('post_id', post.id),
          db.from('post_views').delete().eq('post_id', post.id),
          db.from('notifications').delete().eq('post_id', post.id),
        ]);

        // Post delete
        await db.from('posts').delete().eq('id', post.id);

        // Media delete
        if(post.media_url) {
          await deleteMediaProduction(
            post.media_url,
            post.media_type === 'video' ? 'reel' : 'post',
            'admin_hard_delete'
          );
        }
      } catch(e) {
        console.error(`Auto-purge failed for post ${post.id}:`, e);
      }
    }

    console.log(`✅ Auto-purge complete: ${toPurge.length} posts`);
  } catch(e) {
    console.error('Auto-purge error (non-critical):', e);
  } finally {
    window._autoPurgeRunning = false;
  }
};
