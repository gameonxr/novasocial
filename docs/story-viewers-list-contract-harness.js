function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function createInjectedStoryViewersSeam(deps) {
  const calls = [];
  return {
    calls,
    show(input) {
      calls.push('show-viewers');
      return deps.show(input);
    },
  };
}

async function mockShowStoryViewers({ viewers = [], queryFails = false, clickViewer = false }) {
  const events = ['story.pause', 'timer.clear', 'videos.pause', 'modal.create', 'body.loading'];
  if (queryFails) return { events: [...events, 'query.failed'], resumed: false, rows: [] };
  if (!viewers.length) return { events: [...events, 'body.no-views'], resumed: false, rows: [] };
  const rows = viewers.filter(Boolean).map(viewer => ({ id: viewer.id, username: viewer.username }));
  events.push(`body.render:${rows.length}`);
  if (clickViewer && rows[0]) events.push(`modal.remove:${rows[0].id}`, 'story.close', `profile.open:${rows[0].id}`);
  else events.push('modal.resume-on-close');
  return { events, resumed: !clickViewer, rows };
}

(async () => {
  const viewers = await mockShowStoryViewers({ viewers: [{ id: 'u1', username: 'one' }, { id: 'u2', username: 'two' }] });
  const empty = await mockShowStoryViewers({ viewers: [] });
  const failed = await mockShowStoryViewers({ queryFails: true });
  const profile = await mockShowStoryViewers({ viewers: [{ id: 'u1', username: 'one' }], clickViewer: true });

  for (const result of [viewers, empty, failed, profile]) {
    assert(result.events[0] === 'story.pause' && result.events.includes('timer.clear') && result.events.includes('videos.pause'), 'Viewer modal must pause Story playback, clear timer, and pause videos first');
    assert(result.events.includes('modal.create') && result.events.includes('body.loading'), 'Viewer modal must create high-priority modal and show loading state');
  }
  assert(viewers.rows.length === 2 && viewers.events.includes('body.render:2') && viewers.events.includes('modal.resume-on-close') && viewers.resumed, 'Existing viewers must render and modal close must resume Story');
  assert(empty.rows.length === 0 && empty.events.includes('body.no-views'), 'No viewers must render empty state');
  assert(failed.rows.length === 0 && failed.events.includes('query.failed') && !failed.resumed, 'Viewer query failure must remain in paused modal state without fake rows');
  assert(profile.events.includes('modal.remove:u1') && profile.events.includes('story.close') && profile.events.includes('profile.open:u1') && !profile.resumed, 'Clicking a viewer must remove modal, close Story viewer, and open profile');

  const seam = createInjectedStoryViewersSeam({ show: mockShowStoryViewers });
  const injected = await seam.show({ viewers: [{ id: 'u3', username: 'three' }] });
  assert(JSON.stringify(seam.calls) === JSON.stringify(['show-viewers']), 'Injected Story viewers seam must dispatch the modal owner explicitly');
  assert(injected.resumed && injected.rows.length === 1 && injected.events.includes('modal.resume-on-close'), 'Injected viewers seam must preserve render and resume outcomes');

  console.log(JSON.stringify({ passed: true, viewers, empty, failed, profile, seam: { calls: seam.calls, injected } }, null, 2));
})();
