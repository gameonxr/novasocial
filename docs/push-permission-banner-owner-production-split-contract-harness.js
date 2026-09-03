const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

const repo = process.env.NOVASOCIAL_REPO || path.resolve(__dirname, "..");
const currentHtml = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const originHtml = execFileSync('git', ['show', 'origin/main:index.html'], {
  cwd: repo,
  encoding: 'utf8',
  maxBuffer: 32 * 1024 * 1024
});
const contract = fs.readFileSync(path.join(repo, 'docs', 'push-permission-banner-owner-production-split-contract.md'), 'utf8');
const authorization = fs.readFileSync(path.join(repo, 'docs', 'push-permission-banner-owner-production-authorization-addendum.md'), 'utf8');
const moduleSource = fs.readFileSync(path.join(repo, 'src', 'features', 'push-permission-banner-owner.js'), 'utf8');

function extractOwner(text) {
  const start = text.indexOf('function maybeShowPushPermissionBanner()');
  assert(start >= 0, 'maybeShowPushPermissionBanner owner declaration must exist');
  const end = text.indexOf('\n}\n', start);
  assert(end > start, 'Push banner owner boundary must be discoverable');
  return text.slice(start, end + 2);
}
function sha(value) {
  return crypto.createHash('sha256').update(value.replace(/\r\n/g, '\n')).digest('hex');
}
const currentOwner = extractOwner(moduleSource);
const originOwner = extractOwner(originHtml);
assert.strictEqual(currentOwner.replace(/\r\n/g, '\n'), originOwner.replace(/\r\n/g, '\n'), 'Branch2 Push banner owner must retain exact immutable-origin parity');
assert.strictEqual((currentHtml.match(/function maybeShowPushPermissionBanner\(/g) || []).length, 0, 'inline Push banner owner must be removed');
assert.strictEqual((currentHtml.match(/src=[\"']src\/features\/push-permission-banner-owner\.js[\"']/g) || []).length, 1, 'one Push banner module linkage must exist');
assert(moduleSource.includes('window.maybeShowPushPermissionBanner = function maybeShowPushPermissionBanner()'), 'classic Push banner owner must be window-assigned once');
assert(contract.includes('EXACT_ORIGIN_PARITY=REQUIRED'), 'contract must require exact parity');
assert(contract.includes('DETACHED_LIFECYCLE_PROOF=REQUIRED'), 'contract must require detached proof');
assert(contract.includes('PRODUCTION_DECISION=AUTHORIZED_FOR_BOUNDED_OWNER_ONLY'), 'contract must record bounded production authorization');
assert(authorization.includes('PRODUCTION_DECISION=AUTHORIZED_FOR_BOUNDED_OWNER_ONLY'), 'authorization addendum must record bounded production authorization');

function stable(value) {
  return JSON.parse(JSON.stringify(value));
}

async function runBanner(ownerSource, scenario) {
  const events = [];
  const timers = [];
  const local = new Map(scenario.dismissed ? [[`nova_push_banner_dismissed_${scenario.userId}`, '1']] : []);
  const writes = [];
  const subscriptions = [];
  const permissionCalls = [];
  let banner = scenario.alreadyVisible ? makeBanner(events) : null;
  const existingBanner = banner;
  const document = {
    body: {
      appendChild(node) { banner = node; events.push('dom.append:push-permission-banner'); },
    },
    getElementById(id) {
      events.push(`dom.get:${id}`);
      if (id === 'push-permission-banner' && existingBanner) return existingBanner;
      return null;
    },
    createElement(tag) {
      events.push(`dom.create:${tag}`);
      assert.strictEqual(tag, 'div');
      return makeBanner(events);
    },
  };
  const notification = {
    permission: scenario.permission,
    requestPermission() {
      permissionCalls.push('requestPermission');
      events.push('notification.requestPermission');
      if (scenario.permissionRequestError) return Promise.reject(new Error('synthetic permission failure'));
      return Promise.resolve(scenario.requestResult);
    },
  };
  const context = {
    document,
    window: scenario.supported ? { PushManager: function PushManager() {} } : {},
    navigator: scenario.supported ? { serviceWorker: {} } : {},
    Notification: notification,
    ME: { id: scenario.userId },
    localStorage: {
      getItem(key) { events.push(`storage.get:${key}`); return local.get(key) || null; },
      setItem(key, value) { writes.push({ key, value }); local.set(key, value); events.push(`storage.set:${key}:${value}`); },
    },
    setTimeout(callback, delay) { timers.push({ callback, delay }); events.push(`timer.set:${delay}`); return timers.length; },
    ico(name) { events.push(`ico:${name}`); return `[${name}]`; },
    toast(message) { events.push(`toast:${message}`); },
    subscribeToPushNotifications: async () => {
      subscriptions.push('subscribeToPushNotifications');
      events.push('subscribeToPushNotifications');
      return scenario.subscribeResult !== false;
    },
    console: {
      warn(message) { events.push(`console.warn:${message}`); },
      error(message) { events.push(`console.error:${message}`); },
    },
  };
  const fn = vm.runInNewContext(`(${ownerSource})`, context);
  fn();
  if (timers.length && scenario.logoutBeforeTimer) context.ME = null;
  while (timers.length) {
    const timer = timers.shift();
    assert.strictEqual(timer.delay, 4000);
    await timer.callback();
  }
  if (banner && scenario.action) {
    const buttonId = scenario.action === 'enable' ? '#push-banner-enable' : '#push-banner-dismiss';
    const button = banner.querySelector(buttonId);
    assert(button, `button ${buttonId} must exist in synthetic banner`);
    await button.onclick();
  }
  await Promise.resolve();
  return stable({
    events,
    timersRemaining: timers.length,
    banner: banner ? { id: banner.id, removed: banner.removed, enableHandler: typeof banner.enable.onclick, dismissHandler: typeof banner.dismiss.onclick } : null,
    writes,
    subscriptions,
    permissionCalls,
  });
}

function makeBanner(events) {
  const enable = { onclick: null };
  const dismiss = { onclick: null };
  return {
    id: 'push-permission-banner',
    style: {},
    innerHTML: '',
    removed: false,
    enable,
    dismiss,
    querySelector(selector) {
      events.push(`dom.query:${selector}`);
      if (selector === '#push-banner-enable') return enable;
      if (selector === '#push-banner-dismiss') return dismiss;
      return null;
    },
    remove() { this.removed = true; events.push('dom.remove:push-permission-banner'); },
  };
}

(async () => {
  const base = { permission: 'default', requestResult: 'granted', subscribeResult: true, userId: 'synthetic-user' };
  const scenarios = {
    unsupported: { ...base, supported: false },
    alreadyGranted: { ...base, supported: true, permission: 'granted' },
    alreadyDenied: { ...base, supported: true, permission: 'denied' },
    previouslyDismissed: { ...base, supported: true, dismissed: true },
    delayedCreate: { ...base, supported: true },
    loggedOutBeforeTimer: { ...base, supported: true, logoutBeforeTimer: true },
    alreadyVisible: { ...base, supported: true, alreadyVisible: true },
    enableGranted: { ...base, supported: true, action: 'enable', requestResult: 'granted' },
    enableDenied: { ...base, supported: true, action: 'enable', requestResult: 'denied' },
    enableError: { ...base, supported: true, action: 'enable', permissionRequestError: true },
    dismiss: { ...base, supported: true, action: 'dismiss' },
  };
  const results = {};
  for (const [name, scenario] of Object.entries(scenarios)) {
    const before = await runBanner(originOwner, scenario);
    const after = await runBanner(currentOwner, scenario);
    assert.deepStrictEqual(after, before, `${name} before/after trace must match`);
    results[name] = before;
  }

  assert.strictEqual(results.unsupported.events.length, 0, 'unsupported browser must skip silently');
  assert.strictEqual(results.alreadyGranted.events.length, 0, 'granted permission must skip silently');
  assert.strictEqual(results.alreadyDenied.events.length, 0, 'denied permission must skip silently');
  assert.strictEqual(results.previouslyDismissed.events.length, 1, 'dismissed account must perform only the storage read');
  assert(results.delayedCreate.events.includes('timer.set:4000'), 'eligible banner must schedule four-second creation');
  assert.strictEqual(results.delayedCreate.banner.id, 'push-permission-banner', 'eligible timer must create the banner');
  assert.strictEqual(results.delayedCreate.banner.removed, false, 'banner remains until user action');
  assert(results.loggedOutBeforeTimer.events.includes('timer.set:4000'), 'logout scenario must schedule before logout');
  assert.strictEqual(results.loggedOutBeforeTimer.banner, null, 'logged-out delayed callback must not create a banner');
  assert.strictEqual(results.alreadyVisible.events.filter(event => event === 'timer.set:4000').length, 1, 'existing banner path schedules its normal delayed eligibility check');
  assert(!results.alreadyVisible.events.includes('dom.create:div'), 'existing banner must not create a duplicate');
  assert(results.enableGranted.events.includes('notification.requestPermission'), 'enable grant must request permission');
  assert(results.enableGranted.events.includes('toast:Notifications enabled 🔔'), 'enable grant must show enabled toast');
  assert.deepStrictEqual(results.enableGranted.subscriptions, ['subscribeToPushNotifications'], 'enable grant must hand off once');
  assert(results.enableGranted.events.indexOf('toast:Notifications enabled 🔔') < results.enableGranted.events.indexOf('subscribeToPushNotifications'), 'enabled toast must precede subscription handoff');
  assert.strictEqual(results.enableGranted.banner.removed, true, 'enable grant must remove banner');
  assert(results.enableDenied.events.includes('toast:You can enable later in Settings'), 'denial must show later-settings toast');
  assert.deepStrictEqual(results.enableDenied.subscriptions, [], 'denial must not subscribe');
  assert.strictEqual(results.enableDenied.banner.removed, true, 'denial must remove banner');
  assert(results.enableError.events.some(event => event.startsWith('console.error:[Push] Permission request failed:')), 'permission error must be contained');
  assert.deepStrictEqual(results.enableError.subscriptions, [], 'permission error must not subscribe');
  assert.strictEqual(results.enableError.banner.removed, true, 'permission error must remove banner');
  assert.deepStrictEqual(results.dismiss.writes, [{ key: 'nova_push_banner_dismissed_synthetic-user', value: '1' }], 'dismissal must persist the account-scoped flag');
  assert.strictEqual(results.dismiss.banner.removed, true, 'dismissal must remove banner');
  const forbidden = Object.values(results).flatMap(result => result.events).filter(event => /fetch|db\.|upload|permission\.request|pushmanager|serviceworker\.ready|storage\.set|media|history|navigate/i.test(event));
  const allowedPermissionEvent = 'notification.requestPermission';
  const unexpected = forbidden.filter(event => event !== allowedPermissionEvent && !event.startsWith('storage.set:nova_push_banner_dismissed_'));
  assert.deepStrictEqual(unexpected, [], 'Push banner proof must not perform live side effects');

  console.log('PUSH_PERMISSION_BANNER_OWNER_PRODUCTION_SPLIT_HARNESS=PASS');
  console.log(`ORIGIN_OWNER_SHA256=${sha(originOwner)}`);
  console.log('OWNER_PARITY=PASS');
  console.log('UNSUPPORTED_GRANTED_DENIED_GATES=PASS');
  console.log('DISMISSED_ACCOUNT_GATE=PASS');
  console.log('DELAYED_BANNER_CREATION=PASS');
  console.log('LOGGED_OUT_DELAYED_CLEANUP=PASS');
  console.log('ENABLE_GRANTED=PASS');
  console.log('ENABLE_DENIED=PASS');
  console.log('ENABLE_ERROR=PASS');
  console.log('DISMISSAL_PERSISTENCE=PASS');
  console.log('TIMING_AND_CLEANUP=PASS');
  console.log('LIVE_PERMISSION_REQUESTS=0');
  console.log('LIVE_SERVICE_WORKER_ACCESS=0');
  console.log('LIVE_PUSH_MANAGER_ACCESS=0');
  console.log('DATABASE_WRITES=0');
  console.log('STORAGE_WRITES=MOCKED_DISMISSAL_ONLY');
  console.log('NETWORK_SIDE_EFFECTS=0');
  console.log('ACCOUNT_MUTATIONS=0');
  console.log('PRODUCTION_SPLIT=PASS');
})();
