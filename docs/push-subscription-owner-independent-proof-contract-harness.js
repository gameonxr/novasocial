const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

const repo = '/home/ubuntu/novasocial';
const currentHtml = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const originHtml = execFileSync('git', ['show', 'origin/main:index.html'], {
  cwd: repo,
  encoding: 'utf8',
  maxBuffer: 32 * 1024 * 1024
});
const contract = fs.readFileSync(path.join(repo, 'docs', 'push-subscription-owner-independent-proof-contract.md'), 'utf8');
const dossier = fs.readFileSync(path.join(repo, 'docs', 'push-permission-resubscribe-protected-readiness-contract.md'), 'utf8');

function extractOwner(text) {
  const start = text.indexOf('async function subscribeToPushNotifications()');
  assert(start >= 0, 'subscribeToPushNotifications owner declaration must exist');
  const end = text.indexOf('\n}\n', start);
  assert(end > start, 'Push subscription owner boundary must be discoverable');
  return text.slice(start, end + 2);
}
function sha(value) {
  return crypto.createHash('sha256').update(value.replace(/\r\n/g, '\n')).digest('hex');
}
function stable(value) {
  return JSON.parse(JSON.stringify(value));
}
const currentOwner = extractOwner(currentHtml);
const originOwner = extractOwner(originHtml);
assert.strictEqual(currentOwner.replace(/\r\n/g, '\n'), originOwner.replace(/\r\n/g, '\n'), 'Branch2 Push subscription owner must retain exact immutable-origin parity');
assert.strictEqual(currentHtml.split('async function subscribeToPushNotifications()').length - 1, 1, 'one inline Push subscription owner must remain');
assert(!currentHtml.includes('src/features/push-subscription-owner.js'), 'production Push subscription owner must not be extracted');
assert(contract.includes('EXACT_ORIGIN_PARITY=REQUIRED'), 'contract must require exact parity');
assert(contract.includes('DETACHED_SYNTHETIC_PROOF=REQUIRED'), 'contract must require detached proof');
assert(contract.includes('PRODUCTION_DECISION=BLOCKED'), 'contract must keep production blocked');
assert(dossier.includes('PRODUCTION_DECISION=BLOCKED'), 'protected Push dossier must remain blocked');

async function runSubscription(ownerSource, scenario) {
  const events = [];
  const calls = [];
  const fixedNow = 1700000000000;
  const vapid = 'BJ0cpJ4UjNgiw3Q24Ah65N797A7FBpwT1awmS2wl2oos5uhCPOGn3ibjyqLfVpXEzVq6-1WLV159k5WSKsvccLw';
  const existingSubscription = scenario.existing ? makeSubscription(events, 'https://push.example/existing') : null;
  const registration = {
    pushManager: {
      async getSubscription() {
        events.push('pushManager.getSubscription');
        if (scenario.getSubscriptionError) throw new Error('synthetic getSubscription failure');
        return existingSubscription;
      },
      async subscribe(options) {
        events.push('pushManager.subscribe');
        calls.push({ operation: 'subscribe', options });
        assert.deepStrictEqual(stable(options), { userVisibleOnly: true, applicationServerKey: [7, 8, 9] }, 'new subscription options must remain exact');
        if (scenario.subscribeError) throw new Error('synthetic subscribe failure');
        return makeSubscription(events, 'https://push.example/new');
      },
    },
  };
  const db = {
    from(table) {
      events.push(`db.from:${table}`);
      assert.strictEqual(table, 'push_subscriptions');
      return {
        upsert(payload, options) {
          events.push('db.upsert');
          calls.push({ operation: 'upsert', payload, options });
          return {
            async throwOnError() {
              events.push('db.throwOnError');
              if (scenario.dbError) throw new Error('synthetic database failure');
            },
          };
        },
      };
    },
  };
  const context = {
    navigator: scenario.supported ? { serviceWorker: { ready: Promise.resolve(registration) }, userAgent: 'SyntheticPushBrowser/'.padEnd(260, 'x') } : {},
    window: scenario.supported ? { PushManager: function PushManager() {} } : {},
    ME: scenario.loggedIn === false ? null : { id: 'synthetic-user' },
    VAPID_PUBLIC_KEY: vapid,
    db,
    urlBase64ToUint8Array(value) {
      events.push(`vapid.convert:${value === vapid ? 'exact' : 'wrong'}`);
      assert.strictEqual(value, vapid, 'VAPID key input must remain exact');
      return [7, 8, 9];
    },
    Date: class SyntheticDate extends Date {
      constructor(...args) { super(args.length ? args[0] : fixedNow); }
      static now() { return fixedNow; }
    },
    console: {
      warn(message) { events.push(`console.warn:${message}`); },
      log(message) { events.push(`console.log:${message}`); },
      error(message) { events.push(`console.error:${message}`); },
    },
  };
  const fn = vm.runInNewContext(`(${ownerSource})`, context);
  const result = await fn();
  return stable({ result, events, calls });
}

function makeSubscription(events, endpoint) {
  return {
    endpoint,
    toJSON() {
      events.push(`subscription.toJSON:${endpoint}`);
      return { endpoint, keys: { p256dh: 'synthetic-p256dh', auth: 'synthetic-auth' } };
    },
  };
}

(async () => {
  const scenarios = {
    unsupported: { supported: false },
    missingUser: { supported: true, loggedIn: false },
    existing: { supported: true, existing: true },
    newSubscription: { supported: true, existing: false },
    subscribeFailure: { supported: true, existing: false, subscribeError: true },
    databaseFailure: { supported: true, existing: true, dbError: true },
    getSubscriptionFailure: { supported: true, getSubscriptionError: true },
  };
  const results = {};
  for (const [name, scenario] of Object.entries(scenarios)) {
    const before = await runSubscription(originOwner, scenario);
    const after = await runSubscription(currentOwner, scenario);
    assert.deepStrictEqual(after, before, `${name} before/after trace must match`);
    results[name] = before;
  }

  assert.strictEqual(results.unsupported.result, false, 'unsupported browser must return false');
  assert.deepStrictEqual(results.unsupported.events, ['console.warn:[Push] Not supported on this browser'], 'unsupported browser must stop before dependencies');
  assert.strictEqual(results.missingUser.result, false, 'missing user must return false');
  assert.deepStrictEqual(results.missingUser.events, ['console.warn:[Push] No logged-in user — skipping subscribe'], 'missing user must stop before service-worker access');
  assert.strictEqual(results.existing.result, true, 'existing subscription path must succeed');
  assert.deepStrictEqual(results.existing.calls, [{
    operation: 'upsert',
    payload: {
      user_id: 'synthetic-user', endpoint: 'https://push.example/existing', p256dh: 'synthetic-p256dh', auth: 'synthetic-auth',
      device_info: 'SyntheticPushBrowser/'.padEnd(200, 'x'), last_used_at: new Date(1700000000000).toISOString()
    },
    options: { onConflict: 'endpoint' },
  }], 'existing subscription payload and conflict policy must remain exact');
  assert.strictEqual(results.newSubscription.result, true, 'new subscription path must succeed');
  assert.deepStrictEqual(results.newSubscription.calls[0], { operation: 'subscribe', options: { userVisibleOnly: true, applicationServerKey: [7, 8, 9] } }, 'new subscription options must remain exact');
  assert.strictEqual(results.newSubscription.calls[1].payload.endpoint, 'https://push.example/new', 'new endpoint must be serialized');
  assert.strictEqual(results.newSubscription.calls[1].payload.device_info.length, 200, 'device info must be truncated to 200 characters');
  assert(results.newSubscription.events.includes('vapid.convert:exact'), 'new path must convert the exact VAPID key');
  for (const name of ['subscribeFailure', 'databaseFailure', 'getSubscriptionFailure']) {
    assert.strictEqual(results[name].result, false, `${name} must return false`);
    assert(results[name].events.some(event => event.startsWith('console.error:[Push]')), `${name} must be contained by Push error handling`);
  }
  assert.strictEqual(results.subscribeFailure.events.includes('db.upsert'), false, 'subscribe failure must not write DB');
  assert.strictEqual(results.databaseFailure.events.includes('db.throwOnError'), true, 'database failure must reach throwOnError mock');

  const forbidden = Object.values(results).flatMap(result => result.events).filter(event => /permission|storage|fetch|upload|history|navigate|real/i.test(event));
  assert.deepStrictEqual(forbidden, [], 'Push subscription proof must not perform live permission/storage/network/navigation effects');

  console.log('PUSH_SUBSCRIPTION_OWNER_INDEPENDENT_PROOF_HARNESS=PASS');
  console.log(`ORIGIN_OWNER_SHA256=${sha(originOwner)}`);
  console.log('OWNER_PARITY=PASS');
  console.log('UNSUPPORTED_GATE=PASS');
  console.log('MISSING_USER_GATE=PASS');
  console.log('EXISTING_SUBSCRIPTION_REFRESH=PASS');
  console.log('NEW_SUBSCRIPTION_CREATE=PASS');
  console.log('VAPID_AND_SUBSCRIBE_OPTIONS=PASS');
  console.log('DB_PAYLOAD_AND_CONFLICT_POLICY=PASS');
  console.log('SUBSCRIBE_FAILURE=PASS');
  console.log('DATABASE_FAILURE=PASS');
  console.log('GET_SUBSCRIPTION_FAILURE=PASS');
  console.log('DEVICE_INFO_TRUNCATION=PASS');
  console.log('LIVE_PERMISSION_REQUESTS=0');
  console.log('LIVE_SERVICE_WORKER_ACCESS=0');
  console.log('LIVE_PUSH_MANAGER_ACCESS=0');
  console.log('DATABASE_WRITES=MOCKED_ONLY');
  console.log('STORAGE_WRITES=0');
  console.log('NETWORK_SIDE_EFFECTS=0');
  console.log('ACCOUNT_MUTATIONS=0');
  console.log('PRODUCTION_SPLIT=0');
})();
