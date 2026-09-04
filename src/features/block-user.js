// blockUser — extracted from index.html
// Owner SHA-256: 352f38c741be5381f0248df3b24ff45a5237e0281fb7f34b5b2d95cb8205dbd2
// Classic script — exposes window.blockUser

window.blockUser = async function blockUser(userId, btn) {
  // Premium custom dialog (replaces native confirm() for visual consistency with the app theme)
  const confirmed = await showConfirmDialog(
    "They won't be able to find your profile or message you.",
    { title: 'Block this user?', confirmText: 'Block', cancelText: 'Cancel' }
  );
  if (!confirmed) return;
  try {
    // Part 12 pattern: use .throwOnError() so DB errors actually throw — without this,
    // Supabase-JS returns {error} silently and the function would show a success toast
    // even when nothing was written (RLS misconfig, conflict, network hiccup, etc.)
    await db.from('blocks').insert({ blocker_id: ME.id, blocked_id: userId }).throwOnError();
  } catch(e) {
    // ── 23505 = Postgres unique-constraint violation ──
    // Means the user is ALREADY blocked (race condition: blocked from another tab/device,
    // or an entry point that didn't pre-check status). Not a real error — sync the UI to
    // reflect the actual blocked state and exit gracefully.
    if (e.code === '23505') {
      toast('User already blocked 🚫');
      if(btn) {
        btn.textContent = 'Unblock';
        btn.setAttribute('onclick', `unblockUser('${userId}', this)`);
      }
      return;
    }
    console.error('Block failed:', e);
    toast('Could not block user — please try again 😕');
    return; // don't update button state if the insert actually failed
  }
  toast('User blocked 🚫');
  if(btn) {
    btn.textContent = 'Unblock';
    btn.setAttribute('onclick', `unblockUser('${userId}', this)`);
  }

  // ── Part 2b: Auto-unfollow in both directions (Instagram-style) ──
  // Block se pehle jo bhi follow relationship thi (either direction), wo break ho jaaye.
  // Wrap in own try/catch — agar cleanup fail ho, block itself already successful hai,
  // so we just log and continue. Don't roll back the block.
  try {
    await db.from('follows').delete()
      .eq('follower_id', ME.id).eq('following_id', userId);
    await db.from('follows').delete()
      .eq('follower_id', userId).eq('following_id', ME.id);
  } catch(e) {
    console.warn('Auto-unfollow after block failed (non-critical, block itself succeeded):', e);
  }

  // ── Part 2c: Remove their existing likes/comments on MY posts (Instagram-style) ──
  // When you block someone, their engagement on your content disappears.
  // Same non-blocking approach — failure here doesn't undo the block.
  try {
    const { data: myPosts } = await db.from('posts').select('id').eq('user_id', ME.id);
    const myPostIds = (myPosts || []).map(p => p.id);
    if (myPostIds.length) {
      // Column names verified against existing working queries:
      // likes: user_id, post_id, reaction (line 4493, 5115, etc.)
      // comments: user_id, post_id, text (line 5135, 5208, etc.)
      await db.from('likes').delete().eq('user_id', userId).in('post_id', myPostIds);
      await db.from('comments').delete().eq('user_id', userId).in('post_id', myPostIds);
    }
  } catch(e) {
    console.warn('Like/comment cleanup after block failed (non-critical, block itself succeeded):', e);
  }
};
