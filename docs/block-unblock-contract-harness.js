function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function mockBlock({ confirmed = true, dbError = null, cleanupFails = false, posts = ['p1', 'p2'], hasButton = true }) {
  const events = [];
  const state = { label: 'Block', onclick: 'block' };
  if (!confirmed) return { events: ['confirm.cancel'], blocked: false, state };
  if (dbError === '23505') {
    events.push('blocks.insert.throwOnError.duplicate', 'toast:already-blocked');
    if (hasButton) {
      state.label = 'Unblock';
      state.onclick = 'unblock';
      events.push('button.unblock');
    }
    return { events, blocked: false, duplicate: true, state };
  }
  if (dbError) return { events: ['blocks.insert.throwOnError.failed', 'toast:block-failed'], blocked: false, state };
  events.push('blocks.insert.throwOnError', 'toast:blocked');
  if (hasButton) {
    state.label = 'Unblock';
    state.onclick = 'unblock';
    events.push('button.unblock');
  }
  if (cleanupFails) events.push('cleanup.failed.nonfatal');
  else {
    events.push('follows.delete.mine', 'follows.delete.theirs');
    if (posts.length) events.push(`likes-comments.cleanup:${posts.length}`);
  }
  return { events, blocked: true, state };
}

async function mockUnblock({ dbError = false, hasButton = true }) {
  const events = [];
  const state = { label: 'Unblock', onclick: 'unblock' };
  if (dbError) return { events: ['blocks.delete.throwOnError.failed', 'toast:unblock-failed'], unblocked: false, state };
  events.push('blocks.delete.throwOnError', 'toast:unblocked');
  if (hasButton) {
    state.label = 'Block';
    state.onclick = 'block';
    events.push('button.block');
  }
  return { events, unblocked: true, state };
}

(async () => {
  const cancelled = await mockBlock({ confirmed: false });
  const success = await mockBlock({});
  const duplicate = await mockBlock({ dbError: '23505' });
  const failed = await mockBlock({ dbError: 'network' });
  const cleanupFailure = await mockBlock({ cleanupFails: true });
  const emptyPosts = await mockBlock({ posts: [] });
  const unblocked = await mockUnblock({});
  const unblockFailed = await mockUnblock({ dbError: true });

  assert(!cancelled.blocked && cancelled.events.includes('confirm.cancel'), 'Cancelled block must stop before any mutation');
  assert(success.blocked && success.events.includes('blocks.insert.throwOnError') && success.events.includes('follows.delete.mine') && success.events.includes('follows.delete.theirs') && success.events.includes('likes-comments.cleanup:2') && success.state.label === 'Unblock', 'Successful block must mutate, update UI, clean follows/engagement, and remain blocked');
  assert(duplicate.duplicate && duplicate.events.includes('toast:already-blocked') && duplicate.state.label === 'Unblock', 'Duplicate block must synchronize UI to already-blocked state');
  assert(!failed.blocked && failed.events.includes('toast:block-failed') && failed.state.label === 'Block', 'Generic block failure must preserve button state');
  assert(cleanupFailure.blocked && cleanupFailure.events.includes('cleanup.failed.nonfatal'), 'Cleanup failure must not roll back a successful block');
  assert(emptyPosts.blocked && !emptyPosts.events.some(event => event.startsWith('likes-comments.cleanup')), 'Block with no owned posts must skip engagement cleanup safely');
  assert(unblocked.unblocked && unblocked.events.includes('blocks.delete.throwOnError') && unblocked.state.label === 'Block', 'Successful unblock must delete and restore Block button');
  assert(!unblockFailed.unblocked && unblockFailed.events.includes('toast:unblock-failed') && unblockFailed.state.label === 'Unblock', 'Unblock failure must preserve button state');

  console.log(JSON.stringify({ passed: true, cancelled, success, duplicate, failed, cleanupFailure, emptyPosts, unblocked, unblockFailed }, null, 2));
})();
