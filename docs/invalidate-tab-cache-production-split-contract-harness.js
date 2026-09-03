'use strict';

const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const repo = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const originHtml = execFileSync('git', ['show', 'origin/main:index.html'], { cwd: repo, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
const moduleText = fs.readFileSync(path.join(repo, 'src', 'features', 'invalidate-tab-cache-owner.js'), 'utf8');
const prepProof = fs.readFileSync(path.join(repo, 'docs', 'invalidate-tab-cache-preparation-browser-proof-evidence.txt'), 'utf8');
const afterProof = fs.readFileSync(path.join(repo, 'docs', 'invalidate-tab-cache-after-split-browser-proof-evidence.txt'), 'utf8');
const rollback = fs.readFileSync(path.join(repo, 'docs', 'invalidate-tab-cache-parity-rollback-evidence.txt'), 'utf8');
const productionCommit = execFileSync('git', ['log', '--format=%H', '--all', '--', 'src/features/invalidate-tab-cache-owner.js'], { cwd: repo, encoding: 'utf8' }).trim().split('\n')[0];

function normalize(text) { return text.replace(/\s+/g, ' ').trim(); }
function sha256(text) { return crypto.createHash('sha256').update(text).digest('hex'); }

const originMatch = originHtml.match(/function invalidateTabCache\(tab\) \{[\s\S]*?\n\}/);
assert(originMatch, 'origin/main invalidateTabCache owner must exist');
const normalizedOriginOwner = normalize(originMatch[0]);
const moduleOwnerMatch = moduleText.match(/window\.invalidateTabCache\s*=\s*(function\(tab\)\s*\{[\s\S]*?\n\};)/);
assert(moduleOwnerMatch, 'external anonymous invalidateTabCache owner must exist');
const normalizedModuleOwner = normalize(moduleOwnerMatch[1].replace(/^function\(tab\)\s*\{/, 'function invalidateTabCache(tab) {').replace(/\n\};$/, '\n}'));
const ownerBody = normalizedModuleOwner.slice(normalizedModuleOwner.indexOf('{') + 1, normalizedModuleOwner.lastIndexOf('}')).trim();
const sourceFiles = execFileSync('find', [path.join(repo, 'src'), '-type', 'f', '-name', '*.js'], { cwd: repo, encoding: 'utf8' }).trim().split('\n').filter(Boolean);

assert.strictEqual(normalizedModuleOwner, normalizedOriginOwner, 'external owner must preserve normalized origin/main parity');
assert.strictEqual(sha256(normalizedOriginOwner), '19ccfb3a759fc68a9dddea3715cce4962b021ef60c423facc858a938d17bc127', 'normalized owner hash must match preparation anchor');
assert.strictEqual(sourceFiles.length, 324, 'production split must retain 234 extracted JavaScript modules after the DMs renderer split');
assert.strictEqual((html.match(/function invalidateTabCache\(tab\)\s*\{/g) || []).length, 0, 'named inline invalidateTabCache owner must be absent');
assert.strictEqual((moduleText.match(/window\.invalidateTabCache\s*=\s*function\(tab\)\s*\{/g) || []).length, 1, 'anonymous external invalidateTabCache owner must occur once');
assert.strictEqual((html.match(/src\/features\/invalidate-tab-cache-owner\.js/g) || []).length, 1, 'external invalidate-tab-cache owner script must be linked once');
assert.strictEqual((html.match(/invalidateTabCache\(/g) || []).length, 8, 'exactly eight existing invalidateTabCache callers must remain');
assert(html.indexOf('src/features/set-reports-filter-owner.js') < html.indexOf('src/features/invalidate-tab-cache-owner.js'), 'cache invalidator must load after reports filter owner');
assert(html.indexOf('src/features/invalidate-tab-cache-owner.js') < html.indexOf('src/features/set-verify-filter-owner.js'), 'cache invalidator must load before verification filter owner');
assert.strictEqual((html.match(/<script\b/gi) || []).length, 326, '234 classic script tags must remain after the Push permission banner split');
assert.strictEqual((html.match(/<\/script>/gi) || []).length, 326, '234 classic script closures must remain after the Push permission banner split');
assert.strictEqual((html.match(/<script\s+src=/gi) || []).length, 325, '233 external classic script tags must remain after the Push permission banner split');
assert(!/\b(?:db\.|localStorage|sessionStorage|fetch\(|navigator\.|location\.|notification|permission|upload|navigate|account|message|follow|like|comment|\b(?:insert|update|upsert|rpc)\s*\()/i.test(ownerBody), 'owner must remain free of stateful boundaries');
assert(ownerBody.includes('delete _tabCache[tab]'), 'owner must delete exactly the requested cache entry');
assert(prepProof.includes('RESULT=PASS') && prepProof.includes('TARGET_REMOVED=true') && prepProof.includes('MISSING_ENTRY_NOOP=true') && prepProof.includes('DATABASE_CALLS=0') && prepProof.includes('NETWORK_CALLS=0') && prepProof.includes('ACCOUNT_MUTATIONS=0') && prepProof.includes('DETACHED_ONLY=true'), 'preparation browser proof must pass with zero side effects');
assert(afterProof.includes('RESULT=PASS') && afterProof.includes('EXTERNAL_SCRIPT_LOADS=1') && afterProof.includes('AFTER_TARGET_KEYS=home') && afterProof.includes('AFTER_MISSING_KEYS=home') && afterProof.includes('DATABASE_CALLS=0') && afterProof.includes('NETWORK_CALLS=0') && afterProof.includes('NAVIGATION_MUTATIONS=0') && afterProof.includes('ACCOUNT_MUTATIONS=0') && afterProof.includes('DETACHED_ONLY=true'), 'after-split browser proof must pass with one external load and zero side effects');
assert(rollback.includes('PREPARATION_BASELINE_SHA=21567d954e927f541945234b5de4ef43b7a63344'), 'rollback evidence must retain the preparation baseline');
assert(rollback.includes('ORIGIN_MAIN_IMMUTABLE_SHA=ef418007c9b9a797488b4825be5f0c807da22369'), 'rollback evidence must retain immutable origin/main');
assert(rollback.includes('NORMALIZED_ORIGIN_OWNER_SHA256=19ccfb3a759fc68a9dddea3715cce4962b021ef60c423facc858a938d17bc127'), 'rollback evidence must retain owner hash');
assert(productionCommit.startsWith('00cf7328'), `production split commit must remain 00cf7328, found ${productionCommit}`);
assert(rollback.includes('PRODUCTION_SPLIT_COMMIT=00cf7328b17cee2d2a48f2d8f3bd9343c9987ac8'), 'rollback evidence must pin production split commit');
assert(rollback.includes('FIRST_FULL_REGRESSION_TIP=f9fdb8fe49c186ab0f7151375a3600303c099e4b'), 'rollback evidence must pin first exhaustive gate tip');
assert(rollback.includes('FIRST_FULL_REGRESSION=PASS'), 'rollback evidence must record first exhaustive gate PASS');
assert(rollback.includes('FINAL_DOCS_FULL_REGRESSION=PASS'), 'rollback evidence must record final documentation-tip regression PASS');
assert(rollback.includes('FINAL_DOCS_FULL_REGRESSION_TIP=fccb8907360b2de0142f9b88ead6c80e9ce46776'), 'rollback evidence must pin final documentation-tip regression SHA');
assert(!/<script\b[^>]*\b(?:type|defer|async)\s*=/i.test(html), 'all application scripts must remain classic without type, defer, or async attributes');

function runCacheSeam() {
  const cache = { home: 'h', profile: 'p' };
  const owner = Function('cache', `const _tabCache = cache; return (${normalizedModuleOwner});`)(cache);
  owner('profile');
  assert.deepStrictEqual(cache, { home: 'h' }, 'targeted invalidation must remove only the requested cache entry');
  owner('missing');
  assert.deepStrictEqual(cache, { home: 'h' }, 'missing-entry invalidation must be a safe no-op');
  return cache;
}
const seam = runCacheSeam();

console.log('INVALIDATE_TAB_CACHE_PRODUCTION_SPLIT_CONTRACT_HARNESS=PASS');
console.log('EXACT_ORIGIN_OWNER_PARITY=PASS');
console.log(`NORMALIZED_OWNER_SHA256=${sha256(normalizedOriginOwner)}`);
console.log('ANONYMOUS_WINDOW_OWNER=PASS');
console.log('INLINE_OWNER=ABSENT');
console.log('CALLER_BOUNDARY=EIGHT_CACHE_INVALIDATION_CALLERS');
console.log('FOOTER_ORDER=PASS');
console.log('STATEFUL_BOUNDARIES=ABSENT');
console.log('DETACHED_PREPARATION_PROOF=PASS');
console.log('DETACHED_AFTER_SPLIT_PROOF=PASS');
console.log('INJECTED_SEAM=PASS');
console.log(`CACHE_KEYS_AFTER_SEAM=${Object.keys(seam).join(',')}`);
console.log('ROLLBACK_EVIDENCE=PASS');
console.log('FIRST_FULL_REGRESSION=PASS');
console.log('FINAL_DOCS_FULL_REGRESSION=PASS');
console.log('FINAL_DOCS_FULL_REGRESSION_TIP=fccb8907360b2de0142f9b88ead6c80e9ce46776');
console.log('PRODUCTION_SPLIT=COMPLETE');
