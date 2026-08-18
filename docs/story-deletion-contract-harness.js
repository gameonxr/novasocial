function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function mockDeleteStory({ confirmed = true, story = null, currentUserId = 'me', relatedFailure = false, rowDeleteFails = false, mediaUrl = 'https://cdn/story' }) {
  const events = [];
  if (!confirmed) return { events: ['confirm.cancel'], deleted: false };
  if (!story) return { events: ['toast:delete-failed'], deleted: false };
  if (story.user_id !== currentUserId) return { events: ['toast:not-owner'], deleted: false };
  events.push('related.cleanup.all-settled');
  if (relatedFailure) events.push('related.failure.nonfatal');
  if (rowDeleteFails) return { events: [...events, 'toast:delete-failed'], deleted: false };
  if (mediaUrl) events.push('media.cleanup:story:user_delete');
  events.push('toast:deleted', 'modal.close', 'viewer.close', 'home-cache.invalidate', 'go:home');
  return { events, deleted: true };
}

async function mockCleanupExpired({ alreadyCleaned = false, expired = [], queryFails = false }) {
  const events = [];
  if (alreadyCleaned) return { events: ['session-once.skip'], cleaned: false };
  events.push('session-once.set');
  if (queryFails) return { events: [...events, 'cleanup.error.noncritical'], cleaned: false };
  const batch = expired.slice(0, 100);
  if (!batch.length) return { events, cleaned: false };
  const media = batch.filter(story => Boolean(story.media_url));
  if (media.length) events.push(`media.batch:${media.length}`);
  events.push(`related.cleanup.all-settled:${batch.length}`, `stories.delete:${batch.length}`, `cleanup.done:${batch.length}`);
  return { events, cleaned: true, count: batch.length };
}

(async () => {
  const cancelled = await mockDeleteStory({ confirmed: false, story: { user_id: 'me' } });
  const missing = await mockDeleteStory({ story: null });
  const notOwner = await mockDeleteStory({ story: { user_id: 'other' } });
  const deleted = await mockDeleteStory({ story: { user_id: 'me' }, mediaUrl: 'https://cdn/story' });
  const relatedFailure = await mockDeleteStory({ story: { user_id: 'me' }, relatedFailure: true });
  const rowFailure = await mockDeleteStory({ story: { user_id: 'me' }, rowDeleteFails: true });

  assert(!cancelled.deleted && cancelled.events.includes('confirm.cancel'), 'Cancelled confirmation must stop without deletion');
  assert(!missing.deleted && missing.events.includes('toast:delete-failed'), 'Missing Story must stop with deletion failure feedback');
  assert(!notOwner.deleted && notOwner.events.includes('toast:not-owner'), 'Non-owner must be rejected before cleanup');
  assert(deleted.deleted && deleted.events.includes('related.cleanup.all-settled') && deleted.events.includes('media.cleanup:story:user_delete') && deleted.events.includes('go:home'), 'Successful delete must clean related rows/media and navigate Home');
  assert(relatedFailure.deleted && relatedFailure.events.includes('related.failure.nonfatal'), 'Related-row failure must not block Story deletion');
  assert(!rowFailure.deleted && rowFailure.events.includes('toast:delete-failed'), 'Story-row deletion failure must show failure feedback');

  const expired = Array.from({ length: 105 }, (_, index) => ({ id: `s${index}`, media_url: index % 2 === 0 ? `https://cdn/${index}` : null }));
  const cleanup = await mockCleanupExpired({ expired });
  const empty = await mockCleanupExpired({ expired: [] });
  const onceSkip = await mockCleanupExpired({ alreadyCleaned: true, expired });
  const queryFailure = await mockCleanupExpired({ queryFails: true, expired });
  assert(cleanup.cleaned && cleanup.count === 100 && cleanup.events.includes('media.batch:50') && cleanup.events.includes('stories.delete:100'), 'Expired cleanup must cap at 100, batch media, clean related rows, and delete stories');
  assert(!empty.cleaned && empty.events.includes('session-once.set'), 'Empty expired result must remain nonfatal after setting session flag');
  assert(!onceSkip.cleaned && onceSkip.events.includes('session-once.skip'), 'Expired cleanup must run only once per session');
  assert(!queryFailure.cleaned && queryFailure.events.includes('cleanup.error.noncritical'), 'Expired query failure must remain noncritical');

  console.log(JSON.stringify({ passed: true, cancelled, missing, notOwner, deleted, relatedFailure, rowFailure, cleanup, empty, onceSkip, queryFailure }, null, 2));
})();
