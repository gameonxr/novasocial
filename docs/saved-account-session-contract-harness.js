function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function makeStore(initial = '[]') {
  let raw = initial;
  return {
    getItem() { return raw; },
    setItem(_key, value) { raw = value; },
    raw() { return raw; },
  };
}

function getSavedAccounts(store) {
  try { return JSON.parse(store.getItem('nova_accounts') || '[]'); }
  catch (_) { return []; }
}

function saveAccountSession(store, userId, username, avatarUrl, session, savedAt) {
  let accounts = getSavedAccounts(store);
  accounts = accounts.filter(account => account.userId !== userId);
  accounts.unshift({ userId, username, avatarUrl, access_token: session.access_token, refresh_token: session.refresh_token, savedAt });
  if (accounts.length > 5) accounts = accounts.slice(0, 5);
  store.setItem('nova_accounts', JSON.stringify(accounts));
}

function removeAccountSession(store, userId) {
  const accounts = getSavedAccounts(store).filter(account => account.userId !== userId);
  store.setItem('nova_accounts', JSON.stringify(accounts));
}

(() => {
  const store = makeStore(JSON.stringify([
    { userId: 'u1', username: 'old-one', avatarUrl: 'a1', access_token: 'old-a1', refresh_token: 'old-r1', savedAt: 1 },
    { userId: 'u2', username: 'two', avatarUrl: 'a2', access_token: 'a2', refresh_token: 'r2', savedAt: 2 },
  ]));
  saveAccountSession(store, 'u1', 'new-one', 'new-a1', { access_token: 'new-a1-token', refresh_token: 'new-r1-token' }, 100);
  let accounts = getSavedAccounts(store);
  assert(accounts.length === 2 && accounts[0].userId === 'u1' && accounts[0].username === 'new-one', 'Saving existing account must replace duplicate and move it to front');
  assert(accounts[0].access_token === 'new-a1-token' && accounts[0].refresh_token === 'new-r1-token' && accounts[0].savedAt === 100, 'Saved session must preserve latest tokens and timestamp');

  for (let i = 3; i <= 7; i += 1) {
    saveAccountSession(store, `u${i}`, `user-${i}`, `a${i}`, { access_token: `t${i}`, refresh_token: `r${i}` }, i);
  }
  accounts = getSavedAccounts(store);
  assert(accounts.length === 5, 'Saved accounts must be capped at five entries');
  assert(accounts.map(account => account.userId).join(',') === 'u7,u6,u5,u4,u3', 'New sessions must be newest-first after cap');
  assert(!accounts.some(account => account.userId === 'u1' || account.userId === 'u2'), 'Oldest entries must be evicted when cap is exceeded');

  removeAccountSession(store, 'u5');
  accounts = getSavedAccounts(store);
  assert(accounts.length === 4 && !accounts.some(account => account.userId === 'u5'), 'Removing an account must filter only the requested user');

  const malformed = makeStore('{not-json');
  assert(getSavedAccounts(malformed).length === 0, 'Malformed saved-account storage must fall back to an empty list');
  saveAccountSession(malformed, 'fresh', 'fresh-user', 'fresh-avatar', { access_token: 'fresh-token', refresh_token: 'fresh-refresh' }, 999);
  accounts = getSavedAccounts(malformed);
  assert(accounts.length === 1 && accounts[0].userId === 'fresh', 'Saving after malformed storage must recover from empty fallback');

  console.log(JSON.stringify({ passed: true, replaced: store.raw(), afterRemoval: accounts, malformedRecovered: getSavedAccounts(malformed) }, null, 2));
})();
