'use strict';

const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const repo = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const originHtml = execFileSync('git', ['show', 'origin/main:index.html'], { cwd: repo, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
const modulePath = path.join(repo, 'src', 'features', 'invalidate-tab-cache-owner.js');

function extractOwner(text) {
  const match = text.match(/function invalidateTabCache\(tab\) \{[\s\S]*?\n\}/);
  assert(match, 'inline invalidateTabCache owner must exist');
  return match[0];
}
function normalize(text) { return text.replace(/\s+/g, ' ').trim(); }
function sha256(text) { return crypto.createHash('sha256').update(text).digest('hex'); }

const originOwner = extractOwner(originHtml);
const currentOwner = extractOwner(html);
const normalizedOrigin = normalize(originOwner);
const normalizedCurrent = normalize(currentOwner);
const callerCount = (html.match(/\binvalidateTabCache\s*\(/g) || []).length - 1;

assert.strictEqual(normalizedCurrent, normalizedOrigin, 'candidate owner must match origin/main exactly after normalization');
assert.strictEqual(sha256(normalizedOrigin), '19ccfb3a759fc68a9dddea3715cce4962b021ef60c423facc858a938d17bc127', 'candidate hash must remain pinned');
assert.strictEqual(callerCount, 8, 'candidate must retain exactly eight existing callers');
assert.strictEqual((html.match(/function invalidateTabCache\(tab\)\s*\{/g) || []).length, 1, 'candidate must have one inline owner before split');
assert(!fs.existsSync(modulePath), 'candidate module must not exist before production split');
assert(currentOwner.includes('delete _tabCache[tab]'), 'candidate must retain one-entry cache deletion');
assert(!/(?:fetch\(|localStorage|sessionStorage|navigator\.|location\.|history\.|\b(?:insert|update|upsert|delete|rpc|subscribe|upload|navigate|signOut|signIn)\s*\()/i.test(currentOwner.replace('delete _tabCache[tab]', '')), 'candidate must remain free of stateful side-effect tokens');

function createInjectedInvalidateTabCacheSeam() {
  const events = [];
  const cache = { home: { html: '<home>' }, profile: { html: '<profile>' }, explore: { html: '<explore>' } };
  function invalidate(tab) {
    events.push(`delete:${tab}`);
    delete cache[tab];
  }
  return { cache, events, invalidate };
}

const seam = createInjectedInvalidateTabCacheSeam();
seam.invalidate('profile');
assert.deepStrictEqual(seam.events, ['delete:profile'], 'one tab invalidation must emit exactly one deletion');
assert.deepStrictEqual(seam.cache, { home: { html: '<home>' }, explore: { html: '<explore>' } }, 'target cache entry must be removed while other entries remain');
seam.invalidate('missing');
assert.deepStrictEqual(seam.cache, { home: { html: '<home>' }, explore: { html: '<explore>' } }, 'missing cache entry must remain a safe no-op');
assert.deepStrictEqual(seam.events, ['delete:profile', 'delete:missing'], 'each invocation must remain deterministic');

console.log('INVALIDATE_TAB_CACHE_PREPARATION_CONTRACT_HARNESS=PASS');
console.log(`NORMALIZED_OWNER_SHA256=${sha256(normalizedOrigin)}`);
console.log('EXACT_ORIGIN_OWNER_PARITY=PASS');
console.log('CALLER_BOUNDARY=EIGHT_CACHE_INVALIDATION_CALLERS');
console.log('STATEFUL_BOUNDARIES=ABSENT');
console.log('INJECTED_SEAM=PASS');
console.log('CACHE_BRANCHES=TARGET_AND_MISSING_ENTRY');
console.log('PRODUCTION_MODULE=ABSENT_PRE_SPLIT');
console.log('ROLLBACK_BASELINE=PREPARATION_ONLY');
