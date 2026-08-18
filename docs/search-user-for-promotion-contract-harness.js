'use strict';

const assert = require('assert');

async function runHarness() {
  const originalSetTimeout = global.setTimeout;
  const originalClearTimeout = global.clearTimeout;
  const originalDocument = global.document;
  const originalDb = global.db;
  const originalME = global.ME;
  const originalPROF = global.PROF;
  const originalAv = global.av;
  const originalEsc = global.esc;
  const originalAdminPromoteModerator = global.adminPromoteModerator;
  const originalAdminPromoteUser = global.adminPromoteUser;

  let pendingTimer = null;
  const elements = new Map();
  const calls = [];

  global.setTimeout = (fn, delay) => {
    pendingTimer = { fn, delay };
    return pendingTimer;
  };
  global.clearTimeout = timer => {
    if (timer === pendingTimer) pendingTimer = null;
  };

  function setElement(id) {
    const element = { innerHTML: '' };
    elements.set(id, element);
    return element;
  }
  global.document = { getElementById: id => elements.get(id) || null };
  global.ME = { id: 'self-id' };
  global.PROF = { is_super_admin: false };
  global.av = (avatar, username, size) => `[av:${username}:${size}]`;
  global.esc = value => String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  global.adminPromoteModerator = () => {};
  global.adminPromoteUser = () => {};

  function configureDb({ data = [], error = null }) {
    const builder = {
      select(value) { calls.push(['select', value]); return builder; },
      ilike(column, value) { calls.push(['ilike', column, value]); return builder; },
      neq(column, value) { calls.push(['neq', column, value]); return builder; },
      limit(value) { calls.push(['limit', value]); return Promise.resolve({ data, error }); }
    };
    global.db = { from(table) { calls.push(['from', table]); return builder; } };
  }

  async function flushTimer() {
    assert(pendingTimer, 'expected a scheduled search timer');
    const timer = pendingTimer;
    pendingTimer = null;
    await timer.fn();
    return timer.delay;
  }

  try {
    const source = require('fs').readFileSync('/home/ubuntu/novasocial/index.html', 'utf8');
    const start = source.indexOf('async function searchUserForPromotion(query){');
    assert(start >= 0, 'searchUserForPromotion declaration must remain present');
    const end = source.indexOf('\nfunction showStaffActions(', start);
    assert(end > start, 'searchUserForPromotion boundary must remain unique and ordered');
    const fnSource = source.slice(start, end);
    // The extracted function is evaluated only inside this mocked harness scope.
    eval(`let _teamSearchTimer = null; global.searchUserForPromotion = ${fnSource.slice(fnSource.indexOf('async function searchUserForPromotion'), fnSource.length)}`);

    const results = setElement('team-search-results');

    // Short queries clear inside the deferred callback and do not query the database.
    results.innerHTML = 'stale';
    await global.searchUserForPromotion(' a ');
    assert(pendingTimer, 'short queries still use the helper debounce path');
    await flushTimer();
    assert.strictEqual(results.innerHTML, '', 'queries shorter than two trimmed characters clear results');
    assert.deepStrictEqual(calls, [], 'short queries do not query the database');

    // Debounce uses 300 ms and the latest invocation replaces the prior timer.
    await global.searchUserForPromotion('alice');
    const firstTimer = pendingTimer;
    await global.searchUserForPromotion(' bob ');
    assert.notStrictEqual(firstTimer, pendingTimer, 'a newer query replaces the prior timer');
    assert.strictEqual(pendingTimer.delay, 300, 'search is debounced for 300 ms');

    configureDb({ data: [
      { id: 'u1', username: 'bobcat', avatar_url: 'a', is_admin: false, is_moderator: false, is_super_admin: false },
      { id: 'u2', username: 'staffbob', avatar_url: 'b', is_admin: true, is_moderator: false, is_super_admin: false }
    ] });
    await flushTimer();
    assert.deepStrictEqual(calls, [
      ['from', 'profiles'],
      ['select', 'id,username,avatar_url,is_admin,is_moderator,is_super_admin'],
      ['ilike', 'username', '%bob%'],
      ['neq', 'id', 'self-id'],
      ['limit', 5]
    ], 'search trims query, applies ilike, excludes caller, and limits to five');
    assert(results.innerHTML.includes('bobcat'), 'regular user is rendered');
    assert(results.innerHTML.includes('staffbob'), 'staff user is rendered');
    assert(results.innerHTML.includes('Already staff'), 'existing staff receives an indicator');
    assert(!results.innerHTML.includes('bob-self'), 'current user is not rendered');
    assert(results.innerHTML.includes('Make Mod'), 'non-staff user receives moderator action');
    assert(!results.innerHTML.includes('Make Admin'), 'non-super caller does not receive admin action');

    // Super-admin callers receive both promotion actions for non-staff users.
    global.PROF = { is_super_admin: true };
    calls.length = 0;
    await global.searchUserForPromotion('zoe');
    configureDb({ data: [{ id: 'u3', username: 'zoe', avatar_url: null, is_admin: false, is_moderator: false, is_super_admin: false }] });
    await flushTimer();
    assert(results.innerHTML.includes('Make Mod'), 'super admin sees moderator promotion');
    assert(results.innerHTML.includes('Make Admin'), 'super admin sees admin promotion');

    // Empty results have a stable, non-error empty state.
    calls.length = 0;
    await global.searchUserForPromotion('none');
    configureDb({ data: [] });
    await flushTimer();
    assert.strictEqual(results.innerHTML, '<div style="font-size:11px;color:#666;padding:6px">No users found</div>');

    // Query failures do not throw through the input handler and show a safe message.
    await global.searchUserForPromotion('error');
    configureDb({ data: null, error: new Error('network unavailable') });
    await flushTimer();
    assert.strictEqual(results.innerHTML, '<div style="font-size:11px;color:#FF2D7A;padding:6px">Search failed</div>');

    // Missing result element is a no-op.
    elements.delete('team-search-results');
    await global.searchUserForPromotion('ignored');
    assert(pendingTimer, 'a valid query may schedule before the element check in the deferred callback');
    await flushTimer();

    console.log('SEARCH_USER_FOR_PROMOTION_HARNESS=PASS');
  } finally {
    global.setTimeout = originalSetTimeout;
    global.clearTimeout = originalClearTimeout;
    global.document = originalDocument;
    global.db = originalDb;
    global.ME = originalME;
    global.PROF = originalPROF;
    global.av = originalAv;
    global.esc = originalEsc;
    global.adminPromoteModerator = originalAdminPromoteModerator;
    global.adminPromoteUser = originalAdminPromoteUser;
  }
}

runHarness().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
