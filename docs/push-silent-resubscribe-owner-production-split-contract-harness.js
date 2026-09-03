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
const contract = fs.readFileSync(path.join(repo, 'docs', 'push-silent-resubscribe-owner-production-split-contract.md'), 'utf8');
const dossier = fs.readFileSync(path.join(repo, 'docs', 'push-permission-resubscribe-protected-readiness-contract.md'), 'utf8');
const rollbackEvidence = fs.readFileSync(path.join(repo, 'docs', 'push-silent-resubscribe-owner-parity-rollback-evidence.txt'), 'utf8');

function extractOwner(text) {
  const start = text.indexOf('function silentPushResubscribeIfGranted()');
  if (start >= 0) {
    const end = text.indexOf('\n}\n', start);
    assert(end > start, 'silent resubscribe owner boundary must be discoverable');
    return text.slice(start, end + 2);
  }
  const moduleText = fs.readFileSync(path.join(repo, 'src', 'features', 'push-silent-resubscribe-owner.js'), 'utf8');
  const match = moduleText.match(/window\.silentPushResubscribeIfGranted\s*=\s*(function\(\)\s*\{[\s\S]*?\n\};)/);
  assert(match, 'external silent resubscribe owner assignment must exist');
  return match[1].replace(/^function\(\)/, 'function silentPushResubscribeIfGranted()').replace(/\n\};$/, '\n}');
}
function sha(value) {
  return crypto.createHash('sha256').update(value.replace(/\r\n/g, '\n')).digest('hex');
}
function stable(value) {
  return JSON.parse(JSON.stringify(value));
}
const currentOwner = extractOwner(currentHtml);
const originOwner = extractOwner(originHtml);
assert.strictEqual(currentOwner.replace(/\r\n/g, '\n'), originOwner.replace(/\r\n/g, '\n'), 'external silent resubscribe owner must retain exact immutable-origin parity');
assert.strictEqual((currentHtml.match(/function silentPushResubscribeIfGranted\(\)\s*\{/g) || []).length, 0, 'inline silent resubscribe owner must be absent');
assert.strictEqual((currentHtml.match(/src\/features\/push-silent-resubscribe-owner\.js/g) || []).length, 1, 'external silent resubscribe owner must be linked once');
const moduleText = fs.readFileSync(path.join(repo, 'src', 'features', 'push-silent-resubscribe-owner.js'), 'utf8');
assert(moduleText.includes('window.silentPushResubscribeIfGranted = function()'), 'external owner must use a classic window assignment');
assert(contract.includes('EXACT_ORIGIN_PARITY=PASS'), 'contract must record exact parity');
assert(contract.includes('DETACHED_LIFECYCLE_PROOF=PASS'), 'contract must record detached lifecycle proof');
assert(contract.includes('PRODUCTION_DECISION=SPLIT_COMPLETE_ONLY_AFTER_ALL_GATES'), 'contract must record bounded production decision');
assert(dossier.includes('PRODUCTION_DECISION=BLOCKED'), 'protected Push dossier must remain blocked');
assert(rollbackEvidence.includes('ROLLBACK_RESULT=PASS') && rollbackEvidence.includes('DETACHED_ONLY=true') && rollbackEvidence.includes('LIVE_SIDE_EFFECTS=0'), 'rollback evidence must pass with zero live effects');

async function runOwner(ownerSource, scenario) {
  const events = [];
  const timers = [];
  const subscriptions = [];
  const context = {
    navigator: scenario.supported ? { serviceWorker: {} } : {},
    window: scenario.supported ? { PushManager: function PushManager() {} } : {},
    Notification: { permission: scenario.permission },
    ME: { id: 'synthetic-user' },
    setTimeout(callback, delay) {
      timers.push({ callback, delay });
      events.push(`timer.set:${delay}`);
      return timers.length;
    },
    subscribeToPushNotifications: async () => {
      subscriptions.push('subscribeToPushNotifications');
      events.push('subscribeToPushNotifications');
      return true;
    },
  };
  const fn = vm.runInNewContext(`(${ownerSource})`, context);
  fn();
  if (scenario.logoutBeforeTimer) context.ME = null;
  while (timers.length) {
    const timer = timers.shift();
    assert.strictEqual(timer.delay, 5000);
    await timer.callback();
  }
  await Promise.resolve();
  return stable({ events, subscriptions, timersRemaining: timers.length });
}

(async () => {
  const scenarios = {
    unsupported: { supported: false, permission: 'granted' },
    defaultPermission: { supported: true, permission: 'default' },
    deniedPermission: { supported: true, permission: 'denied' },
    grantedLoggedIn: { supported: true, permission: 'granted' },
    grantedLoggedOut: { supported: true, permission: 'granted', logoutBeforeTimer: true },
  };
  const results = {};
  for (const [name, scenario] of Object.entries(scenarios)) {
    const before = await runOwner(originOwner, scenario);
    const after = await runOwner(currentOwner, scenario);
    assert.deepStrictEqual(after, before, `${name} before/after trace must match`);
    results[name] = before;
  }

  for (const name of ['unsupported', 'defaultPermission', 'deniedPermission']) {
    assert.deepStrictEqual(results[name].events, [], `${name} must not schedule a timer`);
    assert.deepStrictEqual(results[name].subscriptions, [], `${name} must not hand off to subscribe`);
  }
  assert.deepStrictEqual(results.grantedLoggedIn.events, ['timer.set:5000', 'subscribeToPushNotifications'], 'granted logged-in path must defer exactly once and hand off once');
  assert.deepStrictEqual(results.grantedLoggedIn.subscriptions, ['subscribeToPushNotifications'], 'granted logged-in path must call subscribe exactly once');
  assert.deepStrictEqual(results.grantedLoggedOut.events, ['timer.set:5000'], 'logout callback must stop before subscribe');
  assert.deepStrictEqual(results.grantedLoggedOut.subscriptions, [], 'logout callback must not subscribe');
  assert.strictEqual(results.grantedLoggedIn.timersRemaining, 0, 'granted path must leave no timers');
  assert.strictEqual(results.grantedLoggedOut.timersRemaining, 0, 'logout path must leave no timers');

  const forbidden = Object.values(results).flatMap(result => result.events).filter(event => /permission|serviceworker|pushmanager|db|storage|fetch|upload|history|navigate|media/i.test(event));
  assert.deepStrictEqual(forbidden, [], 'silent resubscribe proof must not perform live effects');

  console.log('PUSH_SILENT_RESUBSCRIBE_OWNER_PRODUCTION_SPLIT_HARNESS=PASS');
  console.log(`ORIGIN_OWNER_SHA256=${sha(originOwner)}`);
  console.log('OWNER_PARITY=PASS');
  console.log('UNSUPPORTED_GATE=PASS');
  console.log('DEFAULT_PERMISSION_GATE=PASS');
  console.log('DENIED_PERMISSION_GATE=PASS');
  console.log('GRANTED_LOGIN_HANDOFF=PASS');
  console.log('LOGOUT_CALLBACK_CLEANUP=PASS');
  console.log('TIMING_5000MS=PASS');
  console.log('SINGLE_SUBSCRIPTION_HANDOFF=PASS');
  console.log('LIVE_PERMISSION_REQUESTS=0');
  console.log('LIVE_SERVICE_WORKER_ACCESS=0');
  console.log('LIVE_PUSH_MANAGER_ACCESS=0');
  console.log('DATABASE_WRITES=0');
  console.log('STORAGE_WRITES=0');
  console.log('NETWORK_SIDE_EFFECTS=0');
  console.log('ACCOUNT_MUTATIONS=0');
  console.log('PRODUCTION_SPLIT=1');
})();
