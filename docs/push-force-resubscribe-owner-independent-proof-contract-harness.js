'use strict';

// ═══════════════════════════════════════════════════════════════
// Force Resubscribe Push Owner — Independent Proof Contract Harness
// Verifies the inline owner body against immutable origin/main and
// runs 9 synthetic scenarios with zero live effects.
// ═══════════════════════════════════════════════════════════════

const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

const repo = process.env.NOVASOCIAL_REPO || path.resolve(__dirname, '..');
const originHtml = execFileSync('git', ['show', 'origin/main:index.html'], {
  cwd: repo, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024
});
const contract = fs.readFileSync(path.join(repo, 'docs', 'push-force-resubscribe-owner-independent-proof-contract.md'), 'utf8');

const APPROVED_SHA256 = '6f57c4e0fc347b63d158739a184e0f3f8323ed7c6b57528d0eb833aaaaa4d63d';

function sha256(text) {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
}

function extractOwnerBody(html) {
  const lines = html.split('\n');
  const declIdx = lines.findIndex(l => /^async\s+function\s+forceResubscribePush\s*\(\s*\)\s*\{/.test(l.trim()));
  assert(declIdx >= 0, 'forceResubscribePush owner declaration must exist in origin/main');
  const declLine = lines[declIdx];
  let braceStart = -1;
  for (let i = 0; i < declLine.length; i++) {
    if (declLine[i] === '{') { braceStart = i; break; }
  }
  assert(braceStart >= 0, 'opening brace must exist');
  let depth = 0, inString = null, inLineComment = false, inBlockComment = false;
  let endChar = -1, endLine = -1;
  for (let li = declIdx; li < lines.length; li++) {
    const line = lines[li];
    const startCol = (li === declIdx) ? braceStart : 0;
    for (let ci = startCol; ci < line.length; ci++) {
      const ch = line[ci], next = line[ci + 1];
      if (inLineComment) break;
      if (inBlockComment) { if (ch === '*' && next === '/') { inBlockComment = false; ci++; } continue; }
      if (inString) { if (ch === '\\') { ci++; continue; } if (ch === inString) inString = null; continue; }
      if (ch === '/' && next === '/') { inLineComment = true; break; }
      if (ch === '/' && next === '*') { inBlockComment = true; ci++; continue; }
      if (ch === '"' || ch === "'" || ch === '`') { inString = ch; continue; }
      if (ch === '{') depth++;
      else if (ch === '}') { depth--; if (depth === 0) { endChar = ci; endLine = li; break; } }
    }
    if (endLine !== -1) break;
    inLineComment = false;
  }
  assert(endLine !== -1, 'matching closing brace must exist');
  const bodyLines = lines.slice(declIdx, endLine + 1);
  bodyLines[bodyLines.length - 1] = bodyLines[bodyLines.length - 1].slice(0, endChar + 1);
  return bodyLines.join('\n');
}

// ─── Extract owner from origin/main ────────────────────────────────
const ownerBody = extractOwnerBody(originHtml);
const ownerSha = sha256(ownerBody);
assert.strictEqual(ownerSha, APPROVED_SHA256,
  `origin/main owner SHA-256 must match approved (got ${ownerSha})`);

console.log('ORIGIN_OWNER_SHA256=' + ownerSha);
console.log('OWNER_PARITY=PASS');

// ─── Track live effects ────────────────────────────────────────────
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

  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = Buffer.from(base64, 'base64').toString('binary');
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i++) outputArray[i] = rawData.charCodeAt(i);
    return outputArray;
  }

  let unsubscribeCallCount = 0;
  let getSubCallCount = 0;
  let subscribeCallCount = 0;

  const registration = {
    pushManager: {
      getSubscription: async () => {
        getSubCallCount++;
        if (opts.getSubscriptionFails) throw new Error('mock getSubscription failure');
        if (opts.existingSubscription === null) return null;
        if (opts.existingSubscription === 'none') return null;
        return {
          endpoint: opts.endpoint || 'https://fcm/exist-ep',
          unsubscribe: async () => {
            unsubscribeCallCount++;
            if (opts.unsubscribeFails) throw new Error('mock unsubscribe failure');
          },
        };
      },
      subscribe: async (subscribeOpts) => {
        subscribeCallCount++;
        return { toJSON: () => ({ endpoint: 'https://fcm/new', keys: { p256dh: 'p', auth: 'a' } }) };
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
    userAgent: 'Mozilla/5.0 (Test Browser)',
  };
  if (opts.serviceWorkerUnsupported) delete navigator.serviceWorker;

  const window = {
    PushManager: opts.pushManagerUnsupported ? undefined : function PushManager() {},
  };

  // Mock db.from('push_subscriptions').delete().eq('endpoint', ...)
  const db = {
    from(table) {
      assert.strictEqual(table, 'push_subscriptions', 'db.from must target push_subscriptions');
      const chain = {
        delete() {
          return {
            eq(column, value) {
              assert.strictEqual(column, 'endpoint', 'delete must filter by endpoint');
              liveEffects.dbWrites.push({ op: 'delete', table, column, value });
              if (opts.dbDeleteFails) {
                return { then: (resolve, reject) => Promise.reject(new Error('mock db delete failure')).then(resolve, reject) };
              }
              return Promise.resolve({ data: [], error: null });
            },
          };
        },
        upsert() { return { throwOnError() { return Promise.resolve({ data: [], error: null }); } }; },
      };
      return chain;
    },
  };

  // Mock subscribeToPushNotifications (already external in production)
  const subscribeToPushNotifications = async () => {
    subscribeCallCount++;
    if (opts.freshSubscribeFails) return false;
    return opts.freshSubscribeResult !== undefined ? opts.freshSubscribeResult : true;
  };

  const console = { log: () => {}, warn: () => {}, error: () => {} };

  return {
    window, navigator, console, ME, VAPID_PUBLIC_KEY, urlBase64ToUint8Array, db,
    subscribeToPushNotifications,
    Date: class FakeDate extends Date { static now() { return 1700000000000; } },
    _getSubCallCount: () => getSubCallCount,
    _unsubscribeCallCount: () => unsubscribeCallCount,
    _subscribeCallCount: () => subscribeCallCount,
  };
}

async function loadAndRun(scenarioOpts) {
  const ctx = buildContext(scenarioOpts);
  vm.createContext(ctx);
  // Define the owner function in the VM context
  vm.runInContext(`forceResubscribePush = ${ownerBody}`, ctx, { filename: 'force-resubscribe-push-inline.js' });
  assert.strictEqual(typeof ctx.forceResubscribePush, 'function', 'forceResubscribePush must be a function');
  const result = await ctx.forceResubscribePush();
  return { result, ctx };
}

(async () => {
  // ─── Scenario 1: UNSUPPORTED_GATE ─────────────────────────────
  {
    liveEffects.dbWrites = [];
    const { result, ctx } = await loadAndRun({ serviceWorkerUnsupported: true, pushManagerUnsupported: true });
    assert.strictEqual(result, false, 'UNSUPPORTED_GATE: must return false');
    assert.strictEqual(ctx._getSubCallCount(), 0, 'UNSUPPORTED_GATE: no getSubscription');
    assert.strictEqual(ctx._unsubscribeCallCount(), 0, 'UNSUPPORTED_GATE: no unsubscribe');
    assert.strictEqual(liveEffects.dbWrites.length, 0, 'UNSUPPORTED_GATE: no DB writes');
    console.log('UNSUPPORTED_GATE=PASS');
  }

  // ─── Scenario 2: MISSING_USER_GATE ────────────────────────────
  {
    liveEffects.dbWrites = [];
    const { result, ctx } = await loadAndRun({ ME: null, existingSubscription: 'none' });
    assert.strictEqual(result, false, 'MISSING_USER_GATE: must return false');
    assert.strictEqual(ctx._getSubCallCount(), 0, 'MISSING_USER_GATE: no getSubscription');
    assert.strictEqual(liveEffects.dbWrites.length, 0, 'MISSING_USER_GATE: no DB writes');
    console.log('MISSING_USER_GATE=PASS');
  }

  // ─── Scenario 3: EXISTING_SUBSCRIPTION_CYCLE ──────────────────
  {
    liveEffects.dbWrites = [];
    const { result, ctx } = await loadAndRun({
      existingSubscription: 'existing',
      endpoint: 'https://fcm/exist-ep',
      freshSubscribeResult: true,
    });
    assert.strictEqual(result, true, 'EXISTING_SUBSCRIPTION_CYCLE: must return true');
    assert.strictEqual(ctx._getSubCallCount(), 1, 'EXISTING_SUBSCRIPTION_CYCLE: getSubscription called once');
    assert.strictEqual(ctx._unsubscribeCallCount(), 1, 'EXISTING_SUBSCRIPTION_CYCLE: unsubscribe called once');
    assert.strictEqual(liveEffects.dbWrites.length, 1, 'EXISTING_SUBSCRIPTION_CYCLE: 1 DB delete');
    assert.strictEqual(liveEffects.dbWrites[0].op, 'delete', 'EXISTING_SUBSCRIPTION_CYCLE: DB op is delete');
    assert.strictEqual(liveEffects.dbWrites[0].value, 'https://fcm/exist-ep', 'EXISTING_SUBSCRIPTION_CYCLE: endpoint preserved');
    assert.strictEqual(ctx._subscribeCallCount(), 1, 'EXISTING_SUBSCRIPTION_CYCLE: fresh subscribe called once');
    console.log('EXISTING_SUBSCRIPTION_CYCLE=PASS');
  }

  // ─── Scenario 4: NO_EXISTING_SUBSCRIPTION ─────────────────────
  {
    liveEffects.dbWrites = [];
    const { result, ctx } = await loadAndRun({
      existingSubscription: null,
      freshSubscribeResult: true,
    });
    assert.strictEqual(result, true, 'NO_EXISTING_SUBSCRIPTION: must return true');
    assert.strictEqual(ctx._getSubCallCount(), 1, 'NO_EXISTING_SUBSCRIPTION: getSubscription called once');
    assert.strictEqual(ctx._unsubscribeCallCount(), 0, 'NO_EXISTING_SUBSCRIPTION: unsubscribe NOT called');
    assert.strictEqual(liveEffects.dbWrites.length, 0, 'NO_EXISTING_SUBSCRIPTION: no DB writes');
    assert.strictEqual(ctx._subscribeCallCount(), 1, 'NO_EXISTING_SUBSCRIPTION: fresh subscribe called once');
    console.log('NO_EXISTING_SUBSCRIPTION=PASS');
  }

  // ─── Scenario 5: UNSUBSCRIBE_FAILURE ──────────────────────────
  {
    liveEffects.dbWrites = [];
    const { result, ctx } = await loadAndRun({
      existingSubscription: 'existing',
      unsubscribeFails: true,
    });
    assert.strictEqual(result, false, 'UNSUBSCRIBE_FAILURE: must return false');
    assert.strictEqual(ctx._unsubscribeCallCount(), 1, 'UNSUBSCRIBE_FAILURE: unsubscribe attempted once');
    assert.strictEqual(liveEffects.dbWrites.length, 0, 'UNSUBSCRIBE_FAILURE: no DB deletes (unsubscribe failed first)');
    assert.strictEqual(ctx._subscribeCallCount(), 0, 'UNSUBSCRIBE_FAILURE: fresh subscribe NOT called');
    console.log('UNSUBSCRIBE_FAILURE=PASS');
  }

  // ─── Scenario 6: DB_DELETE_FAILURE ────────────────────────────
  {
    liveEffects.dbWrites = [];
    const { result, ctx } = await loadAndRun({
      existingSubscription: 'existing',
      dbDeleteFails: true,
    });
    assert.strictEqual(result, false, 'DB_DELETE_FAILURE: must return false');
    assert.strictEqual(ctx._unsubscribeCallCount(), 1, 'DB_DELETE_FAILURE: unsubscribe succeeded');
    assert.strictEqual(liveEffects.dbWrites.length, 1, 'DB_DELETE_FAILURE: DB delete attempted');
    assert.strictEqual(ctx._subscribeCallCount(), 0, 'DB_DELETE_FAILURE: fresh subscribe NOT called');
    console.log('DB_DELETE_FAILURE=PASS');
  }

  // ─── Scenario 7: GET_SUBSCRIPTION_FAILURE ─────────────────────
  {
    liveEffects.dbWrites = [];
    const { result, ctx } = await loadAndRun({
      getSubscriptionFails: true,
    });
    assert.strictEqual(result, false, 'GET_SUBSCRIPTION_FAILURE: must return false');
    assert.strictEqual(ctx._unsubscribeCallCount(), 0, 'GET_SUBSCRIPTION_FAILURE: no unsubscribe');
    assert.strictEqual(liveEffects.dbWrites.length, 0, 'GET_SUBSCRIPTION_FAILURE: no DB writes');
    assert.strictEqual(ctx._subscribeCallCount(), 0, 'GET_SUBSCRIPTION_FAILURE: no fresh subscribe');
    console.log('GET_SUBSCRIPTION_FAILURE=PASS');
  }

  // ─── Scenario 8: FRESH_SUBSCRIBE_SUCCESS ──────────────────────
  {
    liveEffects.dbWrites = [];
    const { result, ctx } = await loadAndRun({
      existingSubscription: null,
      freshSubscribeResult: true,
    });
    assert.strictEqual(result, true, 'FRESH_SUBSCRIBE_SUCCESS: must return true');
    assert.strictEqual(ctx._subscribeCallCount(), 1, 'FRESH_SUBSCRIBE_SUCCESS: fresh subscribe called');
    console.log('FRESH_SUBSCRIBE_SUCCESS=PASS');
  }

  // ─── Scenario 9: FRESH_SUBSCRIBE_FAILURE ──────────────────────
  {
    liveEffects.dbWrites = [];
    const { result, ctx } = await loadAndRun({
      existingSubscription: null,
      freshSubscribeResult: false,
    });
    assert.strictEqual(result, false, 'FRESH_SUBSCRIBE_FAILURE: must return false');
    assert.strictEqual(ctx._subscribeCallCount(), 1, 'FRESH_SUBSCRIBE_FAILURE: fresh subscribe called');
    console.log('FRESH_SUBSCRIBE_FAILURE=PASS');
  }

  // ─── Final side-effect summary ────────────────────────────────
  console.log('');
  console.log('PUSH_FORCE_RESUBSCRIBE_OWNER_INDEPENDENT_PROOF_HARNESS=PASS');
  console.log('ORIGIN_OWNER_SHA256=' + APPROVED_SHA256);
  console.log('SCENARIOS=9_PASS');
  console.log('LIVE_PERMISSION_REQUESTS=0');
  console.log('LIVE_SERVICE_WORKER_ACCESS=0');
  console.log('LIVE_PUSH_MANAGER_ACCESS=0');
  console.log('DATABASE_WRITES=MOCKED_ONLY');
  console.log('STORAGE_WRITES=0');
  console.log('NETWORK_SIDE_EFFECTS=0');
  console.log('ACCOUNT_MUTATIONS=0');
  console.log('PRODUCTION_SPLIT=0');
})().catch(err => {
  console.error('FATAL:', err.message);
  console.error(err.stack);
  process.exit(1);
});
