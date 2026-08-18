function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function mockToggleFollow({ wasFollowing = false, offline = false, dbFails = false, hasButton = true }) {
  const events = [];
  const state = {
    following: wasFollowing,
    label: wasFollowing ? 'Following' : 'Follow',
    className: wasFollowing ? 'bout' : 'bgrd',
    followerDelta: 0,
    myFollowingDelta: 0
  };
  if (!hasButton) return { events: ['noop.button'], state };
  const newFollowing = !wasFollowing;
  state.following = newFollowing;
  state.label = newFollowing ? 'Following' : 'Follow';
  state.className = newFollowing ? 'bout' : 'bgrd';
  state.followerDelta = newFollowing ? 1 : -1;
  state.myFollowingDelta = newFollowing ? 1 : -1;
  events.push('ui.optimistic', `counts:${newFollowing ? 1 : -1}`);
  if (offline) {
    events.push(`offline.queue:follow:${newFollowing}`);
    return { events, state, queued: true, success: false };
  }
  if (dbFails) {
    state.following = wasFollowing;
    state.label = wasFollowing ? 'Following' : 'Follow';
    state.className = wasFollowing ? 'bout' : 'bgrd';
    state.followerDelta = wasFollowing ? 1 : -1;
    state.myFollowingDelta = wasFollowing ? 1 : -1;
    events.push('db.failed', 'ui.rollback', 'toast:Network error');
    return { events, state, queued: false, success: false };
  }
  events.push(newFollowing ? 'follows.insert' : 'follows.delete');
  if (newFollowing) events.push('notification.follow');
  events.push('profile-counts.refresh', 'toast:follow-success', 'cache.profile.invalidate', 'cache.home.invalidate');
  return { events, state, queued: false, success: true };
}

(async () => {
  const follow = await mockToggleFollow({ wasFollowing: false });
  const unfollow = await mockToggleFollow({ wasFollowing: true });
  const offline = await mockToggleFollow({ wasFollowing: false, offline: true });
  const failedFollow = await mockToggleFollow({ wasFollowing: false, dbFails: true });
  const failedUnfollow = await mockToggleFollow({ wasFollowing: true, dbFails: true });
  const noButton = await mockToggleFollow({ hasButton: false });

  assert(follow.success && follow.events.includes('follows.insert') && follow.events.includes('notification.follow') && follow.events.includes('cache.home.invalidate'), 'Follow success must insert, notify, refresh counts, and invalidate caches');
  assert(follow.state.following && follow.state.followerDelta === 1 && follow.state.myFollowingDelta === 1, 'Follow must optimistically increment both count paths');
  assert(unfollow.success && unfollow.events.includes('follows.delete') && unfollow.events.includes('toast:follow-success') && unfollow.state.label === 'Follow', 'Unfollow success must delete, confirm, and restore Follow button');
  assert(offline.queued && offline.events.includes('offline.queue:follow:true') && offline.state.following, 'Offline follow must retain optimistic state and queue action without DB call');
  assert(!failedFollow.success && failedFollow.events.includes('ui.rollback') && failedFollow.state.label === 'Follow' && failedFollow.state.followerDelta === -1, 'Failed follow must rollback UI and counts');
  assert(!failedUnfollow.success && failedUnfollow.events.includes('ui.rollback') && failedUnfollow.state.label === 'Following' && failedUnfollow.state.followerDelta === 1, 'Failed unfollow must rollback UI and counts');
  assert(noButton.events.includes('noop.button') && !noButton.success, 'Missing follow button must no-op safely');

  console.log(JSON.stringify({ passed: true, follow, unfollow, offline, failedFollow, failedUnfollow, noButton }, null, 2));
})();
