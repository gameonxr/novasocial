function createTraceAdapter(log) {
  const record = (name) => log.push(name);
  return {
    revealApp: () => record('ui.auth.hide+root.show'),
    setupNotificationsRealtime: () => record('realtime.notifications'),
    setupPostsRealtime: () => record('realtime.posts'),
    initFab: () => record('fab.init'),
    startBanRecheck: () => record('ban.recheck.start'),
    checkEmergencyLock: () => record('security.emergency-check'),
    resetAccountScopedUi: (id) => record(`account.reset:${id || 'null'}`),
    goHome: () => record('navigation.home'),
    scheduleCallingSystem: () => record('delayed.calls.schedule'),
    scheduleSelfProfileRealtime: () => record('delayed.self-profile.schedule'),
    scheduleNotesRealtime: () => record('delayed.notes.schedule'),
    syncSavedAccount: () => record('saved-account.sync'),
    setupOffline: () => record('offline.setup'),
    maybeShowPushBanner: () => record('push.banner.maybe'),
    silentlyResubscribePush: () => record('push.resubscribe.silent'),
    scheduleLifecycleCleanup: () => record('cleanup.schedule:3000'),
  };
}

function runBootstrap(adapter, activeUserId) {
  adapter.revealApp();
  adapter.setupNotificationsRealtime();
  adapter.setupPostsRealtime();
  adapter.initFab();
  adapter.startBanRecheck();
  adapter.checkEmergencyLock();
  adapter.resetAccountScopedUi(activeUserId);
  adapter.goHome();
  adapter.scheduleCallingSystem();
  adapter.scheduleSelfProfileRealtime();
  adapter.scheduleNotesRealtime();
  adapter.syncSavedAccount();
  adapter.setupOffline();
  adapter.maybeShowPushBanner();
  adapter.silentlyResubscribePush();
  adapter.scheduleLifecycleCleanup();
}

function runLoginMode(mode) {
  const events = [];
  const adapter = createTraceAdapter(events);
  if (mode === 'normal') {
    events.push('auth.session.ready');
    events.push('identity.available');
    events.push('profile.loaded');
    runBootstrap(adapter, 'user-normal');
  } else if (mode === 'add-account') {
    events.push('auth.session.ready');
    events.push('add-account.mode.clear');
    events.push('identity.available');
    events.push('profile.loaded');
    events.push('saved-account.sync');
    runBootstrap(adapter, 'user-added');
    events.push('toast.account-added');
  } else {
    throw new Error(`Unknown mode: ${mode}`);
  }
  return events;
}

function assertOrder(events, first, second) {
  const a = events.indexOf(first);
  const b = events.indexOf(second);
  if (a < 0 || b < 0 || a >= b) {
    throw new Error(`Expected ${first} before ${second}: ${JSON.stringify(events)}`);
  }
}

const normal = runLoginMode('normal');
const added = runLoginMode('add-account');
for (const events of [normal, added]) {
  assertOrder(events, 'identity.available', 'profile.loaded');
  assertOrder(events, 'profile.loaded', 'ui.auth.hide+root.show');
  assertOrder(events, 'ui.auth.hide+root.show', 'account.reset:' + (events === normal ? 'user-normal' : 'user-added'));
  assertOrder(events, 'account.reset:' + (events === normal ? 'user-normal' : 'user-added'), 'navigation.home');
  if (events === normal) {
    assertOrder(events, 'navigation.home', 'saved-account.sync');
    assertOrder(events, 'saved-account.sync', 'offline.setup');
  } else {
    const savedSyncs = events.reduce((out, value, index) => value === 'saved-account.sync' ? out.concat(index) : out, []);
    if (savedSyncs.length !== 2) throw new Error(`Expected two add-account saved sync points: ${JSON.stringify(events)}`);
    if (!(savedSyncs[0] < events.indexOf('ui.auth.hide+root.show') && events.indexOf('navigation.home') < savedSyncs[1])) {
      throw new Error(`Unexpected add-account saved sync ordering: ${JSON.stringify(events)}`);
    }
    assertOrder(events, 'saved-account.sync', 'offline.setup');
  }
  assertOrder(events, 'offline.setup', 'push.banner.maybe');
  assertOrder(events, 'push.banner.maybe', 'push.resubscribe.silent');
  assertOrder(events, 'push.resubscribe.silent', 'cleanup.schedule:3000');
}
if (!added.includes('add-account.mode.clear') || !added.includes('toast.account-added')) {
  throw new Error('Add-account mode contract missing');
}
if (normal.includes('add-account.mode.clear') || normal.includes('toast.account-added')) {
  throw new Error('Normal login incorrectly includes add-account events');
}
console.log(JSON.stringify({passed: true, normal, addAccount: added}, null, 2));
