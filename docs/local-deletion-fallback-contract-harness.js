function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function mockSync({ rawQueue = '[]', failures = [], storageThrows = false }) {
  const events = [];
  let removed = false;
  const calls = [];
  const storage = {
    getItem() {
      if (storageThrows) throw new Error('storage unavailable');
      return rawQueue;
    },
    removeItem() { removed = true; events.push('queue.remove'); },
  };
  try {
    const pending = JSON.parse(storage.getItem('_mediaDeleteFallback') || '[]');
    if (!pending.length) return { events, calls, removed };
    events.push(`sync.start:${pending.length}`);
    for (const item of pending) {
      try {
        calls.push(item);
        events.push(`delete:${item.mediaUrl}`);
        if (failures.includes(item.mediaUrl)) throw new Error(`failed:${item.mediaUrl}`);
        events.push(`delete.ok:${item.mediaUrl}`);
      } catch (error) {
        events.push(`delete.error:${item.mediaUrl}`);
      }
    }
    storage.removeItem('_mediaDeleteFallback');
    events.push(`sync.done:${pending.length}`);
  } catch (error) {
    events.push('sync.error.silent');
  }
  return { events, calls, removed };
}

(async () => {
  const empty = await mockSync({ rawQueue: '[]' });
  assert(empty.events.length === 0 && !empty.removed, 'Empty fallback queue must be a no-op and must not remove storage');

  const queue = [
    { mediaUrl: 'https://cdn/one', source: 'post', reason: 'user_delete' },
    { mediaUrl: 'https://cdn/two', source: 'story', reason: 'expired' },
    { mediaUrl: 'https://cdn/three', source: 'note', reason: 'user_delete' },
  ];
  const replay = await mockSync({ rawQueue: JSON.stringify(queue) });
  assert(replay.calls.map(item => item.mediaUrl).join(',') === 'https://cdn/one,https://cdn/two,https://cdn/three', 'Fallback items must replay in stored order');
  assert(replay.removed && replay.events.includes('sync.done:3'), 'Successful replay must clear queue after all items');

  const partial = await mockSync({ rawQueue: JSON.stringify(queue), failures: ['https://cdn/two'] });
  assert(partial.events.includes('delete.error:https://cdn/two') && partial.events.includes('delete.ok:https://cdn/three'), 'One failed item must not stop later items');
  assert(partial.removed && partial.events.includes('sync.done:3'), 'Per-item failure must still allow queue cleanup after replay');

  const malformed = await mockSync({ rawQueue: '{not-json' });
  assert(malformed.events.includes('sync.error.silent') && !malformed.removed, 'Malformed queue must fail silently without deleting storage');

  const unavailable = await mockSync({ storageThrows: true });
  assert(unavailable.events.includes('sync.error.silent') && !unavailable.removed, 'Storage failure must fail silently');

  console.log(JSON.stringify({ passed: true, empty, replay, partial, malformed, unavailable }, null, 2));
})();
