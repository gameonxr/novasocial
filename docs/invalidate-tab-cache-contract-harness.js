'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'invalidate-tab-cache-owner.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

for (const forbidden of [
  /\bdb\b|supabase|\.from\(|\.select\(|\.insert\(|\.update\(|\.delete\(|\.rpc\(/i,
  /fetch\s*\(|XMLHttpRequest|WebSocket/i,
  /localStorage|sessionStorage|indexedDB|document\.cookie/i,
  /document\.|navigator\.mediaDevices|MediaRecorder|RTCPeerConnection/i,
  /\bME\b|\bPROF\b|sendMsg\(|go\(|location\.|history\.|upload|permission|Notification|PushManager/i,
]) {
  assert(!forbidden.test(source), `tab-cache invalidation must remain in-memory-only: ${forbidden}`);
}

assert(html.includes('src/features/invalidate-tab-cache-owner.js'), 'tab-cache invalidation module must remain linked from HTML');
assert.strictEqual((source.match(/window\.invalidateTabCache\s*=\s*function\s*\(/g) || []).length, 1, 'tab-cache invalidation must have one global owner');

const cache = {
  home: { revision: 1 },
  profile: { revision: 2 },
  settings: { revision: 3 },
};
const context = { window: {}, _tabCache: cache };
vm.createContext(context);
vm.runInContext(source, context, { filename: 'invalidate-tab-cache-owner.js' });
assert.strictEqual(typeof context.window.invalidateTabCache, 'function', 'invalidateTabCache must remain globally callable');

context.window.invalidateTabCache('home');
assert.strictEqual(Object.prototype.hasOwnProperty.call(cache, 'home'), false, 'requested tab cache entry must be deleted');
assert.deepStrictEqual(cache.profile, { revision: 2 }, 'unrelated profile cache entry must remain unchanged');
assert.deepStrictEqual(cache.settings, { revision: 3 }, 'unrelated settings cache entry must remain unchanged');

assert.doesNotThrow(() => context.window.invalidateTabCache('missing'), 'missing cache keys must be tolerated');
assert.deepStrictEqual(cache, { profile: { revision: 2 }, settings: { revision: 3 } }, 'missing-key invalidation must not change remaining entries');

context.window.invalidateTabCache('profile');
assert.strictEqual(Object.keys(cache).length, 1, 'each call must affect only its requested key');
assert.strictEqual(cache.settings.revision, 3, 'last unrelated entry must remain intact');

console.log('INVALIDATE_TAB_CACHE_CONTRACT_HARNESS=PASS');
console.log('GLOBAL_OWNER_AND_HTML_LINK=PASS');
console.log('EXACT_KEY_DELETION=PASS');
console.log('UNRELATED_KEYS_PRESERVED=PASS');
console.log('MISSING_KEY_TOLERANCE=PASS');
console.log('PROTECTED_SIDE_EFFECTS=0');
console.log('PRODUCTION_CHANGE=0');
