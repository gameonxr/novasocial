// toggleFollowProfile — extracted from index.html
// Owner SHA-256: bfa0ed82078189dec2461bdce96d2a614cfaa21674df238355f253d3d9298f2c
// Classic script — exposes window.toggleFollowProfile

window.toggleFollowProfile = async function toggleFollowProfile(userId) {
  const btn = document.getElementById('follow-btn');
  if (!btn) return;
  const wasFollowing = btn.textContent.trim() === 'Following';
  const newFollowing = !wasFollowing;
  btn.textContent = newFollowing ? 'Following' : 'Follow';
  btn.className = newFollowing ? 'bout' : 'bgrd';
  adjustFollowerCount(newFollowing ? 1 : -1); // ← Optimistic UI update (already exists, preserved)
  updateMyFollowingCount(newFollowing ? 1 : -1);

  // ── Part 6 Fix 3: Offline queue — agar offline hai, DB call skip karo
  // aur action queue mein daal do (replay on reconnect). UI already updated
  // optimistically above, so user ko turant feedback milta hai.
  if (isOffline()) {
    _queueOfflineAction({
      type: 'follow',
      payload: { userId: userId, following: newFollowing }
    });
    return;
  }

  try {
    let error = null;
    if (newFollowing) {
      const res = await db.from('follows').insert({follower_id: ME.id,following_id: userId});
      error = res.error;
      if (!error) {
        await sendNotif(userId, 'follow', {message: `started following you`});
      }
    } else {
      const res = await db.from('follows').delete().eq('follower_id', ME.id).eq('following_id', userId);
      error = res.error;
    }
    if (error) throw error;
    await refreshProfileCounts(userId);
    toast(newFollowing ? 'Following!' : 'Unfollowed');
    // Invalidate profile + home cache (following list, suggestions wagara update ho)
    invalidateTabCache('profile');
    invalidateTabCache('home');
  } catch (e) {
    console.error(e);
    btn.textContent = wasFollowing ? 'Following' : 'Follow';
    btn.className = wasFollowing ? 'bout' : 'bgrd';
    adjustFollowerCount(wasFollowing ? 1 : -1);
    updateMyFollowingCount(wasFollowing ? 1 : -1);
    toast('Network error');
  }
};
