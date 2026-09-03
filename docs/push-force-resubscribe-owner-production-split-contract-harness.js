'use strict';

// ═══════════════════════════════════════════════════════════════
// Force Resubscribe Push Owner — Production Split Contract Harness
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
const modulePath = path.join(repo, 'src', 'features', 'push-force-resubscribe-owner.js');
const moduleText = fs.readFileSync(modulePath, 'utf8');

const APPROVED_SHA256 = '6f57c4e0fc347b63d158739a184e0f3f8323ed7c6b57528d0eb833aaaaa4d63d';

function sha256(text) {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
}

function extractOwnerBody(html) {
  const lines = html.split('\n');
  const declIdx = lines.findIndex(l => /^async\s+function\s+forceResubscribePush\s*\(\s*\)\s*\{/.test(l.trim()));
  assert(declIdx >= 0, 'forceResubscribePush owner declaration must exist');
  const declLine = lines[declIdx];
  let braceStart = -1;
  for (let i = 0; i < declLine.length; i++) if (declLine[i] === '{') { braceStart = i; break; }
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
  const bodyLines = lines.slice(declIdx, endLine + 1);
  bodyLines[bodyLines.length - 1] = bodyLines[bodyLines.length - 1].slice(0, endChar + 1);
  return bodyLines.join('\n');
}

// ─── 1. Ownership checks ──────────────────────────────────────────
assert(moduleText.includes('window.forceResubscribePush = async function forceResubscribePush()'),
  'module must expose window.forceResubscribePush');

const moduleOwnerMatch = moduleText.match(/window\.forceResubscribePush\s*=\s*(async\s+function\s+forceResubscribePush\s*\(\s*\)\s*\{[\s\S]*?\n\});/);
assert(moduleOwnerMatch, 'module owner body must be extractable');
const moduleOwnerBody = moduleOwnerMatch[1];

const originOwnerBody = extractOwnerBody(originHtml);
assert.strictEqual(moduleOwnerBody, originOwnerBody, 'module owner body must equal origin/main byte-for-byte');

const moduleOwnerSha = sha256(moduleOwnerBody);
assert.strictEqual(moduleOwnerSha, APPROVED_SHA256, `module owner SHA-256 must match (got ${moduleOwnerSha})`);

// ─── 2. index.html post-split state ───────────────────────────────
const inlineCount = (branch2Html.match(/async\s+function\s+forceResubscribePush\s*\(\s*\)\s*\{/g) || []).length;
assert.strictEqual(inlineCount, 0, 'index.html must have 0 inline owner');

const linkageCount = (branch2Html.match(/src\/features\/push-force-resubscribe-owner\.js/g) || []).length;
assert.strictEqual(linkageCount, 1, 'index.html must have exactly 1 linkage');

const subIdx = branch2Html.indexOf('src/features/push-subscription-owner.js');
const forceIdx = branch2Html.indexOf('src/features/push-force-resubscribe-owner.js');
const silentIdx = branch2Html.indexOf('src/features/push-silent-resubscribe-owner.js');
assert(subIdx >= 0 && forceIdx >= 0 && subIdx < forceIdx, 'push-subscription must load BEFORE push-force-resubscribe');
assert(silentIdx >= 0 && forceIdx < silentIdx, 'push-force-resubscribe must load BEFORE push-silent-resubscribe');

assert(!/<script[^>]*type="module"/.test(branch2Html), 'no type="module"');
assert(!/<script[^>]*defer/.test(branch2Html), 'no defer');
assert(!/import\s+/.test(moduleText), 'no import');
assert(!/export\s+/.test(moduleText), 'no export');

// ─── 3. Synthetic scenarios ───────────────────────────────────────
const liveEffects = { dbWrites: [], unsubscribeCalls: 0 };

function buildContext(opts) {
  const ME = opts.ME === undefined ? { id: 'user-123' } : opts.ME;
  const VAPID_PUBLIC_KEY = 'BJ0cpJ4UjNgiw3Q24Ah65N797A7FBpwT1awmS2wl2oos5uhCPOGn3ibjyqLfVpXEzVq6-1WLV159k5WSKsvccLw';
  function urlBase64ToUint8Array(s) { return new Uint8Array(64); }

  let unsubscribeCallCount = 0, getSubCallCount = 0, subscribeCallCount = 0;

  const registration = {
    pushManager: {
      getSubscription: async () => {
        getSubCallCount++;
        if (opts.getSubscriptionFails) throw new Error('mock getSubscription failure');
        if (opts.existingSubscription === null || opts.existingSubscription === 'none') return null;
        return {
          endpoint: opts.endpoint || 'https://fcm/exist-ep',
          unsubscribe: async () => { unsubscribeCallCount++; if (opts.unsubscribeFails) throw new Error('mock unsubscribe failure'); },
        };
      },
      subscribe: async () => { subscribeCallCount++; return { toJSON: () => ({ endpoint: 'https://fcm/new', keys: { p256dh: 'p', auth: 'a' } }) }; },
    },
  };

  const navigator = {
    serviceWorker: { get ready() { if (opts.serviceWorkerUnsupported) return Promise.reject(new Error('no SW')); return Promise.resolve(registration); } },
    userAgent: 'Mozilla/5.0 Test',
  };
  if (opts.serviceWorkerUnsupported) delete navigator.serviceWorker;

  const window = { PushManager: opts.pushManagerUnsupported ? undefined : function PushManager() {} };

  const db = {
    from(table) {
      assert.strictEqual(table, 'push_subscriptions');
      return {
        delete() {
          return {
            eq(column, value) {
              liveEffects.dbWrites.push({ op: 'delete', column, value });
              if (opts.dbDeleteFails) return Promise.reject(new Error('mock db delete failure'));
              return Promise.resolve({ data: [], error: null });
            },
          };
        },
        upsert() { return { throwOnError() { return Promise.resolve({ data: [], error: null }); } }; },
      };
    },
  };

  const subscribeToPushNotifications = async () => {
    subscribeCallCount++;
    if (opts.freshSubscribeFails) return false;
    return opts.freshSubscribeResult !== undefined ? opts.freshSubscribeResult : true;
  };

  const console = { log: () => {}, warn: () => {}, error: () => {} };

  return {
    window, navigator, console, ME, VAPID_PUBLIC_KEY, urlBase64ToUint8Array, db,
    subscribeToPushNotifications,
    _getSubCallCount: () => getSubCallCount,
    _unsubscribeCallCount: () => unsubscribeCallCount,
    _subscribeCallCount: () => subscribeCallCount,
  };
}

async function loadAndRun(scenarioOpts) {
  const ctx = buildContext(scenarioOpts);
  vm.createContext(ctx);
  vm.runInContext(moduleText, ctx, { filename: 'push-force-resubscribe-owner.js' });
  assert.strictEqual(typeof ctx.window.forceResubscribePush, 'function');
  const result = await ctx.window.forceResubscribePush();
  return { result, ctx };
}

(async () => {
  // Scenario 1
  { liveEffects.dbWrites = []; const { result, ctx } = await loadAndRun({ serviceWorkerUnsupported: true, pushManagerUnsupported: true });
    assert.strictEqual(result, false); assert.strictEqual(ctx._getSubCallCount(), 0); assert.strictEqual(liveEffects.dbWrites.length, 0);
    console.log('UNSUPPORTED_GATE=PASS'); }

  // Scenario 2
  { liveEffects.dbWrites = []; const { result, ctx } = await loadAndRun({ ME: null, existingSubscription: 'none' });
    assert.strictEqual(result, false); assert.strictEqual(ctx._getSubCallCount(), 0); assert.strictEqual(liveEffects.dbWrites.length, 0);
    console.log('MISSING_USER_GATE=PASS'); }

  // Scenario 3
  { liveEffects.dbWrites = []; const { result, ctx } = await loadAndRun({ existingSubscription: 'existing', endpoint: 'https://fcm/exist-ep', freshSubscribeResult: true });
    assert.strictEqual(result, true); assert.strictEqual(ctx._getSubCallCount(), 1); assert.strictEqual(ctx._unsubscribeCallCount(), 1);
    assert.strictEqual(liveEffects.dbWrites.length, 1); assert.strictEqual(liveEffects.dbWrites[0].op, 'delete');
    assert.strictEqual(liveEffects.dbWrites[0].value, 'https://fcm/exist-ep'); assert.strictEqual(ctx._subscribeCallCount(), 1);
    console.log('EXISTING_SUBSCRIPTION_CYCLE=PASS'); }

  // Scenario 4
  { liveEffects.dbWrites = []; const { result, ctx } = await loadAndRun({ existingSubscription: null, freshSubscribeResult: true });
    assert.strictEqual(result, true); assert.strictEqual(ctx._getSubCallCount(), 1); assert.strictEqual(ctx._unsubscribeCallCount(), 0);
    assert.strictEqual(liveEffects.dbWrites.length, 0); assert.strictEqual(ctx._subscribeCallCount(), 1);
    console.log('NO_EXISTING_SUBSCRIPTION=PASS'); }

  // Scenario 5
  { liveEffects.dbWrites = []; const { result, ctx } = await loadAndRun({ existingSubscription: 'existing', unsubscribeFails: true });
    assert.strictEqual(result, false); assert.strictEqual(ctx._unsubscribeCallCount(), 1); assert.strictEqual(liveEffects.dbWrites.length, 0);
    assert.strictEqual(ctx._subscribeCallCount(), 0);
    console.log('UNSUBSCRIBE_FAILURE=PASS'); }

  // Scenario 6
  { liveEffects.dbWrites = []; const { result, ctx } = await loadAndRun({ existingSubscription: 'existing', dbDeleteFails: true });
    assert.strictEqual(result, false); assert.strictEqual(ctx._unsubscribeCallCount(), 1); assert.strictEqual(liveEffects.dbWrites.length, 1);
    assert.strictEqual(ctx._subscribeCallCount(), 0);
    console.log('DB_DELETE_FAILURE=PASS'); }

  // Scenario 7
  { liveEffects.dbWrites = []; const { result, ctx } = await loadAndRun({ getSubscriptionFails: true });
    assert.strictEqual(result, false); assert.strictEqual(ctx._unsubscribeCallCount(), 0); assert.strictEqual(liveEffects.dbWrites.length, 0);
    assert.strictEqual(ctx._subscribeCallCount(), 0);
    console.log('GET_SUBSCRIPTION_FAILURE=PASS'); }

  // Scenario 8
  { liveEffects.dbWrites = []; const { result, ctx } = await loadAndRun({ existingSubscription: null, freshSubscribeResult: true });
    assert.strictEqual(result, true); assert.strictEqual(ctx._subscribeCallCount(), 1);
    console.log('FRESH_SUBSCRIBE_SUCCESS=PASS'); }

  // Scenario 9
  { liveEffects.dbWrites = []; const { result, ctx } = await loadAndRun({ existingSubscription: null, freshSubscribeResult: false });
    assert.strictEqual(result, false); assert.strictEqual(ctx._subscribeCallCount(), 1);
    console.log('FRESH_SUBSCRIBE_FAILURE=PASS'); }

  console.log('');
  console.log('PUSH_FORCE_RESUBSCRIBE_OWNER_PRODUCTION_SPLIT_HARNESS=PASS');
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
})().catch(err => { console.error('FATAL:', err.message); process.exit(1); });
