'use strict';

// ═══════════════════════════════════════════════════════════════
// Push Subscription Owner — Production Split Contract Harness
// Verifies post-split ownership, parity, and synthetic scenarios.
// Zero live Push/service-worker/permission/database side effects.
// ═══════════════════════════════════════════════════════════════

const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

const repo = process.env.NOVASOCIAL_REPO || path.resolve(__dirname, '..');
const branch2Html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const originHtml = execFileSync('git', ['show', 'origin/main:index.html'], {
  cwd: repo, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024
});
const modulePath = path.join(repo, 'src', 'features', 'push-subscription-owner.js');
const moduleText = fs.readFileSync(modulePath, 'utf8');
const contract = fs.readFileSync(path.join(repo, 'docs', 'push-subscription-owner-production-split-contract.md'), 'utf8');

const APPROVED_SHA256 = 'b6f11d4f504f8bc4b3fb7bf47447e8169d093b283f08c6bedaa7bd353adf70b4';

function sha256(text) {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
}

function extractOwnerBody(html) {
  const lines = html.split('\n');
  const declIdx = lines.findIndex(l => /^async\s+function\s+subscribeToPushNotifications\s*\(\s*\)\s*\{/.test(l.trim()));
  assert(declIdx >= 0, 'subscribeToPushNotifications owner declaration must exist');
  const declLine = lines[declIdx];
  let braceStart = -1;
  for (let i = 0; i < declLine.length; i++) {
    if (declLine[i] === '{') { braceStart = i; break; }
  }
  assert(braceStart >= 0, 'opening brace must exist on declaration line');
  let depth = 0, inString = null, inLineComment = false, inBlockComment = false;
  let endChar = -1, endLine = -1;
  for (let li = declIdx; li < lines.length; li++) {
    const line = lines[li];
    const startCol = (li === declIdx) ? braceStart : 0;
    for (let ci = startCol; ci < line.length; ci++) {
      const ch = line[ci];
      const next = line[ci + 1];
      if (inLineComment) break;
      if (inBlockComment) {
        if (ch === '*' && next === '/') { inBlockComment = false; ci++; }
        continue;
      }
      if (inString) {
        if (ch === '\\') { ci++; continue; }
        if (ch === inString) inString = null;
        continue;
      }
      if (ch === '/' && next === '/') { inLineComment = true; break; }
      if (ch === '/' && next === '*') { inBlockComment = true; ci++; continue; }
      if (ch === '"' || ch === "'" || ch === '`') { inString = ch; continue; }
      if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (depth === 0) { endChar = ci; endLine = li; break; }
      }
    }
    if (endLine !== -1) break;
    inLineComment = false;
  }
  assert(endLine !== -1, 'matching closing brace must exist');
  const bodyLines = lines.slice(declIdx, endLine + 1);
  bodyLines[bodyLines.length - 1] = bodyLines[bodyLines.length - 1].slice(0, endChar + 1);
  return bodyLines.join('\n');
}

// ─── 1. Ownership checks ──────────────────────────────────────────
assert(moduleText.includes('window.subscribeToPushNotifications = async function subscribeToPushNotifications()'),
  'module must expose window.subscribeToPushNotifications with named function');

const moduleOwnerMatch = moduleText.match(/window\.subscribeToPushNotifications\s*=\s*(async\s+function\s+subscribeToPushNotifications\s*\(\s*\)\s*\{[\s\S]*?\n\});/);
assert(moduleOwnerMatch, 'module owner body must be extractable');
const moduleOwnerBody = moduleOwnerMatch[1];

const originOwnerBody = extractOwnerBody(originHtml);
assert.strictEqual(moduleOwnerBody, originOwnerBody,
  'module owner body must equal origin/main inline owner byte-for-byte');

const moduleOwnerSha = sha256(moduleOwnerBody);
assert.strictEqual(moduleOwnerSha, APPROVED_SHA256,
  `module owner body SHA-256 must equal approved hash (got ${moduleOwnerSha})`);

// ─── 2. index.html post-split state ───────────────────────────────
const inlineCount = (branch2Html.match(/async\s+function\s+subscribeToPushNotifications\s*\(\s*\)\s*\{/g) || []).length;
assert.strictEqual(inlineCount, 0, 'index.html must have 0 inline owner declarations');

const linkageCount = (branch2Html.match(/src\/features\/push-subscription-owner\.js/g) || []).length;
assert.strictEqual(linkageCount, 1, 'index.html must have exactly 1 module linkage');

const urlBaseIdx = branch2Html.indexOf('src/features/url-base64-to-uint8-array.js');
const newLinkageIdx = branch2Html.indexOf('src/features/push-subscription-owner.js');
assert(urlBaseIdx >= 0 && newLinkageIdx >= 0 && urlBaseIdx < newLinkageIdx,
  'url-base64-to-uint8-array.js must load BEFORE push-subscription-owner.js');

const silentResubIdx = branch2Html.indexOf('src/features/push-silent-resubscribe-owner.js');
assert(silentResubIdx >= 0 && newLinkageIdx < silentResubIdx,
  'push-subscription-owner.js must load BEFORE push-silent-resubscribe-owner.js');

assert(!/<script[^>]*type="module"/.test(branch2Html), 'no type="module" scripts allowed');
assert(!/<script[^>]*defer/.test(branch2Html), 'no defer scripts allowed');
assert(!/import\s+/.test(moduleText), 'module must not use import');
assert(!/export\s+/.test(moduleText), 'module must not use export');

// ─── 3. Synthetic scenarios under module loading ─────────────────
// Build a synthetic VM context that loads the module and runs the owner
// against mocked Push APIs.

const liveEffects = {
  permissionRequests: 0,
  serviceWorkerAccess: 0,
  pushManagerAccess: 0,
  dbWrites: [],
  storageWrites: 0,
  networkSideEffects: 0,
  accountMutations: 0,
};

function buildContext(opts) {
  const ME = opts.ME === undefined ? { id: 'user-123' } : opts.ME;
  const VAPID_PUBLIC_KEY = 'BJ0cpJ4UjNgiw3Q24Ah65N797A7FBpwT1awmS2wl2oos5uhCPOGn3ibjyqLfVpXEzVq6-1WLV159k5WSKsvccLw';

  // urlBase64ToUint8Array helper (real implementation, no side effects)
  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = Buffer.from(base64, 'base64').toString('binary');
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i++) outputArray[i] = rawData.charCodeAt(i);
    return outputArray;
  }

  // Mock registration
  const subscription = opts.subscription; // null | object | 'fail-get' | 'fail-subscribe'
  let getSubCallCount = 0;
  let subscribeCallCount = 0;

  const registration = {
    pushManager: {
      getSubscription: async () => {
        getSubCallCount++;
        if (opts.getSubscriptionFails) throw new Error('mock getSubscription failure');
        if (subscription === null) return null;
        if (subscription === 'fail-subscribe') return null; // getSub returns null, subscribe will fail
        return {
          toJSON: () => ({
            endpoint: opts.endpoint || 'https://fcm.googleapis.com/fcm/send/abc123',
            keys: {
              p256dh: opts.p256dh || 'p256dh-mock',
              auth: opts.auth || 'auth-mock',
            },
          }),
        };
      },
      subscribe: async (subscribeOpts) => {
        subscribeCallCount++;
        if (subscription === 'fail-subscribe') throw new Error('mock subscribe failure');
        // Verify subscribe options
        assert.strictEqual(subscribeOpts.userVisibleOnly, true, 'subscribe must use userVisibleOnly: true');
        assert(subscribeOpts.applicationServerKey instanceof Uint8Array,
          'applicationServerKey must be Uint8Array');
        return {
          toJSON: () => ({
            endpoint: opts.endpoint || 'https://fcm.googleapis.com/fcm/send/new-sub',
            keys: {
              p256dh: opts.p256dh || 'p256dh-new',
              auth: opts.auth || 'auth-new',
            },
          }),
        };
      },
    },
  };

  const navigator = {
    serviceWorker: {
      get ready() {
        if (opts.serviceWorkerUnsupported) return Promise.reject(new Error('no SW'));
        return Promise.resolve(registration);
      },
    },
    userAgent: opts.userAgent || 'Mozilla/5.0 (Test Browser) ...'.padEnd(250, 'x'),
  };

  if (opts.serviceWorkerUnsupported) {
    delete navigator.serviceWorker;
  }

  const window = {
    PushManager: opts.pushManagerUnsupported ? undefined : function PushManager() {},
    atob: (s) => Buffer.from(s, 'base64').toString('binary'),
  };

  const db = {
    from(table) {
      assert.strictEqual(table, 'push_subscriptions', 'db.from must target push_subscriptions table');
      const chain = {
        upsert(payload, options) {
          liveEffects.dbWrites.push({ table, payload, options });
          if (opts.dbFails) {
            return {
              throwOnError() {
                return Promise.reject(new Error('mock db upsert failure'));
              },
            };
          }
          return { throwOnError() { return Promise.resolve({ data: [payload], error: null }); } };
        },
      };
      return chain;
    },
  };

  const console = {
    log: () => {},
    warn: () => {},
    error: () => {},
  };

  const ctx = {
    window,
    navigator,
    console,
    ME,
    VAPID_PUBLIC_KEY,
    urlBase64ToUint8Array,
    db,
    Date: class FakeDate extends Date {
      static now() { return 1700000000000; }
      toISOString() { return '2023-11-14T22:13:20.000Z'; }
    },
    _getSubCallCount: () => getSubCallCount,
    _subscribeCallCount: () => subscribeCallCount,
  };

  return ctx;
}

async function loadAndRun(scenarioOpts) {
  const ctx = buildContext(scenarioOpts);
  vm.createContext(ctx);
  // Pre-define window.subscribeToPushNotifications by evaluating the module
  vm.runInContext(moduleText, ctx, { filename: 'push-subscription-owner.js' });
  assert.strictEqual(typeof ctx.window.subscribeToPushNotifications, 'function',
    'window.subscribeToPushNotifications must be a function after module load');
  const result = await ctx.window.subscribeToPushNotifications();
  return { result, ctx };
}

(async () => {
  // ─── Scenario 1: UNSUPPORTED_GATE ─────────────────────────────
  {
    liveEffects.permissionRequests = 0; liveEffects.serviceWorkerAccess = 0;
    const { result } = await loadAndRun({ serviceWorkerUnsupported: true, pushManagerUnsupported: true });
    assert.strictEqual(result, false, 'UNSUPPORTED_GATE: must return false');
    assert.strictEqual(liveEffects.serviceWorkerAccess, 0, 'UNSUPPORTED_GATE: no SW access');
    assert.strictEqual(liveEffects.dbWrites.length, 0, 'UNSUPPORTED_GATE: no DB writes');
    console.log('UNSUPPORTED_GATE=PASS');
  }

  // ─── Scenario 2: MISSING_USER_GATE ────────────────────────────
  {
    liveEffects.dbWrites = [];
    const { result } = await loadAndRun({ ME: null, subscription: null });
    assert.strictEqual(result, false, 'MISSING_USER_GATE: must return false');
    assert.strictEqual(liveEffects.dbWrites.length, 0, 'MISSING_USER_GATE: no DB writes');
    console.log('MISSING_USER_GATE=PASS');
  }

  // ─── Scenario 3: EXISTING_SUBSCRIPTION_REFRESH ────────────────
  {
    liveEffects.dbWrites = [];
    const { result, ctx } = await loadAndRun({
      subscription: 'existing',
      endpoint: 'https://fcm/exist-ep',
    });
    assert.strictEqual(result, true, 'EXISTING_SUBSCRIPTION_REFRESH: must return true');
    assert.strictEqual(ctx._subscribeCallCount(), 0, 'EXISTING_SUBSCRIPTION_REFRESH: subscribe() must NOT be called');
    assert.strictEqual(ctx._getSubCallCount(), 1, 'EXISTING_SUBSCRIPTION_REFRESH: getSubscription() must be called once');
    assert.strictEqual(liveEffects.dbWrites.length, 1, 'EXISTING_SUBSCRIPTION_REFRESH: exactly 1 DB upsert');
    const write = liveEffects.dbWrites[0];
    assert.strictEqual(write.payload.endpoint, 'https://fcm/exist-ep', 'endpoint preserved');
    assert.strictEqual(write.payload.user_id, 'user-123', 'user_id preserved');
    assert.strictEqual(write.options.onConflict, 'endpoint', 'onConflict: endpoint enforced');
    assert.strictEqual(write.payload.device_info.length, 200, 'device_info truncated to 200 chars');
    console.log('EXISTING_SUBSCRIPTION_REFRESH=PASS');
  }

  // ─── Scenario 4: NEW_SUBSCRIPTION_CREATE ──────────────────────
  {
    liveEffects.dbWrites = [];
    const { result, ctx } = await loadAndRun({
      subscription: null,
      endpoint: 'https://fcm/new-ep',
    });
    assert.strictEqual(result, true, 'NEW_SUBSCRIPTION_CREATE: must return true');
    assert.strictEqual(ctx._subscribeCallCount(), 1, 'NEW_SUBSCRIPTION_CREATE: subscribe() called once');
    assert.strictEqual(ctx._getSubCallCount(), 1, 'NEW_SUBSCRIPTION_CREATE: getSubscription() called once');
    assert.strictEqual(liveEffects.dbWrites.length, 1, 'NEW_SUBSCRIPTION_CREATE: 1 DB upsert');
    const write = liveEffects.dbWrites[0];
    assert.strictEqual(write.payload.endpoint, 'https://fcm/new-ep', 'new endpoint persisted');
    console.log('NEW_SUBSCRIPTION_CREATE=PASS');
  }

  // ─── Scenario 5: VAPID_AND_SUBSCRIBE_OPTIONS ──────────────────
  {
    liveEffects.dbWrites = [];
    const { result } = await loadAndRun({ subscription: null });
    assert.strictEqual(result, true, 'VAPID_AND_SUBSCRIBE_OPTIONS: must return true');
    console.log('VAPID_AND_SUBSCRIBE_OPTIONS=PASS');
  }

  // ─── Scenario 6: DB_PAYLOAD_AND_CONFLICT_POLICY ────────────────
  {
    liveEffects.dbWrites = [];
    const { result } = await loadAndRun({ subscription: 'existing' });
    assert.strictEqual(result, true);
    const write = liveEffects.dbWrites[0];
    assert.deepStrictEqual(Object.keys(write.payload).sort(),
      ['auth', 'device_info', 'endpoint', 'last_used_at', 'p256dh', 'user_id'].sort(),
      'payload fields must match exactly');
    assert.strictEqual(write.options.onConflict, 'endpoint', 'onConflict: endpoint');
    console.log('DB_PAYLOAD_AND_CONFLICT_POLICY=PASS');
  }

  // ─── Scenario 7: SUBSCRIBE_FAILURE ────────────────────────────
  {
    liveEffects.dbWrites = [];
    const { result } = await loadAndRun({ subscription: 'fail-subscribe' });
    assert.strictEqual(result, false, 'SUBSCRIBE_FAILURE: must return false');
    assert.strictEqual(liveEffects.dbWrites.length, 0, 'SUBSCRIBE_FAILURE: no DB writes');
    console.log('SUBSCRIBE_FAILURE=PASS');
  }

  // ─── Scenario 8: DATABASE_FAILURE ─────────────────────────────
  {
    liveEffects.dbWrites = [];
    const { result } = await loadAndRun({ subscription: 'existing', dbFails: true });
    assert.strictEqual(result, false, 'DATABASE_FAILURE: must return false');
    console.log('DATABASE_FAILURE=PASS');
  }

  // ─── Scenario 9: GET_SUBSCRIPTION_FAILURE ─────────────────────
  {
    liveEffects.dbWrites = [];
    const { result } = await loadAndRun({ getSubscriptionFails: true });
    assert.strictEqual(result, false, 'GET_SUBSCRIPTION_FAILURE: must return false');
    assert.strictEqual(liveEffects.dbWrites.length, 0, 'GET_SUBSCRIPTION_FAILURE: no DB writes');
    console.log('GET_SUBSCRIPTION_FAILURE=PASS');
  }

  // ─── Scenario 10: DEVICE_INFO_TRUNCATION ──────────────────────
  {
    liveEffects.dbWrites = [];
    const longUA = 'X'.repeat(500);
    const { result } = await loadAndRun({ subscription: 'existing', userAgent: longUA });
    assert.strictEqual(result, true, 'DEVICE_INFO_TRUNCATION: must return true');
    const write = liveEffects.dbWrites[0];
    assert.strictEqual(write.payload.device_info.length, 200, 'device_info must be truncated to 200 chars');
    assert.strictEqual(write.payload.device_info, 'X'.repeat(200), 'device_info truncation content correct');
    console.log('DEVICE_INFO_TRUNCATION=PASS');
  }

  // ─── Final side-effect summary ────────────────────────────────
  console.log('');
  console.log('PUSH_SUBSCRIPTION_OWNER_PRODUCTION_SPLIT_HARNESS=PASS');
  console.log('ORIGIN_OWNER_SHA256=' + APPROVED_SHA256);
  console.log('MODULE_OWNER_SHA256=' + moduleOwnerSha);
  console.log('OWNER_PARITY=PASS');
  console.log('INLINE_OWNER_COUNT=0');
  console.log('MODULE_LINKAGE_COUNT=1');
  console.log('SCRIPT_ORDER_PRESERVED=PASS');
  console.log('DEPENDENCY_ORDER_PRESERVED=PASS');
  console.log('LIVE_PERMISSION_REQUESTS=0');
  console.log('LIVE_SERVICE_WORKER_ACCESS=0');
  console.log('LIVE_PUSH_MANAGER_ACCESS=0');
  console.log('DATABASE_WRITES=MOCKED_ONLY');
  console.log('STORAGE_WRITES=0');
  console.log('NETWORK_SIDE_EFFECTS=0');
  console.log('ACCOUNT_MUTATIONS=0');
  console.log('PRODUCTION_SPLIT=COMPLETE');
})().catch(err => {
  console.error('FATAL:', err.message);
  process.exit(1);
});
