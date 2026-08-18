function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function fmt(value) {
  return value >= 1000 ? `${(value / 1000).toFixed(1).replace('.0', '')}K` : String(value);
}

function mockCount({ initialRaw = 0, delta, hasElement = true }) {
  if (!hasElement) return { events: ['noop.element'], raw: null, text: null };
  const raw = Math.max(0, parseInt(initialRaw || 0) + delta);
  return { events: ['dom.update'], raw, text: fmt(raw) };
}

(() => {
  const followerIncrement = mockCount({ initialRaw: 9, delta: 1 });
  const followerDecrement = mockCount({ initialRaw: 10, delta: -1 });
  const followerFloor = mockCount({ initialRaw: 0, delta: -1 });
  const followingLarge = mockCount({ initialRaw: 999, delta: 1 });
  const malformedRaw = mockCount({ initialRaw: 'not-a-number', delta: 1 });
  const missing = mockCount({ initialRaw: 10, delta: 1, hasElement: false });

  assert(followerIncrement.raw === 10 && followerIncrement.text === '10', 'Positive count delta must update raw data and formatted text');
  assert(followerDecrement.raw === 9 && followerDecrement.text === '9', 'Negative count delta must decrement raw data and formatted text');
  assert(followerFloor.raw === 0 && followerFloor.text === '0', 'Count must never fall below zero');
  assert(followingLarge.raw === 1000 && followingLarge.text === '1K', 'Count formatting must use existing compact formatter at 1000');
  assert(Number.isNaN(malformedRaw.raw) && malformedRaw.text === 'NaN', 'Malformed raw count must preserve existing parseInt/Math.max NaN behavior');
  assert(missing.events.includes('noop.element') && missing.raw === null, 'Missing count element must be a safe no-op');

  console.log(JSON.stringify({ passed: true, followerIncrement, followerDecrement, followerFloor, followingLarge, malformedRaw, missing }, null, 2));
})();
