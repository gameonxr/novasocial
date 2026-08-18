function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function fmt(value) {
  return value >= 1000 ? `${(value / 1000).toFixed(1).replace('.0', '')}K` : String(value);
}

async function mockRefreshProfileCounts({ target = null, me = null, targetQueryFails = false, meQueryFails = false, elements = { followers: true, following: true } }) {
  const events = ['profiles.target.query', 'profiles.me.query'];
  if (targetQueryFails || meQueryFails) return { events: [...events, 'refresh.failed.silent'], updates: {} };
  const updates = {};
  if (target && elements.followers) updates.followers = { raw: target.followers_count || 0, text: fmt(target.followers_count || 0) };
  if (me && elements.following) updates.following = { raw: me.following_count || 0, text: fmt(me.following_count || 0) };
  events.push(`dom.updates:${Object.keys(updates).length}`);
  return { events, updates };
}

(async () => {
  const both = await mockRefreshProfileCounts({ target: { followers_count: 1250 }, me: { following_count: 12 } });
  const zeroFallback = await mockRefreshProfileCounts({ target: { followers_count: 0 }, me: { following_count: null } });
  const missingFollower = await mockRefreshProfileCounts({ target: { followers_count: 5 }, me: { following_count: 7 }, elements: { followers: false, following: true } });
  const targetFail = await mockRefreshProfileCounts({ targetQueryFails: true, target: { followers_count: 5 }, me: { following_count: 7 } });
  const meFail = await mockRefreshProfileCounts({ meQueryFails: true, target: { followers_count: 5 }, me: { following_count: 7 } });

  assert(both.events.includes('profiles.target.query') && both.events.includes('profiles.me.query') && both.updates.followers.text === '1.3K' && both.updates.following.text === '12', 'Refresh must query target/me counts and format both DOM updates');
  assert(zeroFallback.updates.followers.raw === 0 && zeroFallback.updates.following.raw === 0 && zeroFallback.updates.following.text === '0', 'Missing/zero count values must fall back to zero');
  assert(!missingFollower.updates.followers && missingFollower.updates.following.raw === 7, 'Missing follower element must not block following update');
  assert(targetFail.events.includes('refresh.failed.silent') && Object.keys(targetFail.updates).length === 0, 'Target query failure must fail silently');
  assert(meFail.events.includes('refresh.failed.silent') && Object.keys(meFail.updates).length === 0, 'Current-user query failure must fail silently');

  console.log(JSON.stringify({ passed: true, both, zeroFallback, missingFollower, targetFail, meFail }, null, 2));
})();
