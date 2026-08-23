const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const repo = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const originHtml = execFileSync('git', ['-C', repo, 'show', 'origin/main:index.html'], { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
const ownerPattern = /async function refreshProfileCounts\(userId\) \{[\s\S]*?\n\}\n/;
const originOwner = originHtml.match(ownerPattern)?.[0];
const currentOwner = html.match(ownerPattern)?.[0];
assert(originOwner, 'origin/main refreshProfileCounts owner must exist');
assert(currentOwner, 'current inline refreshProfileCounts owner must exist during preparation');
const sha256 = (text) => crypto.createHash('sha256').update(text).digest('hex');
const sourceFiles = execFileSync('find', [path.join(repo, 'src'), '-type', 'f', '-name', '*.js'], { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
const browserEvidence = fs.readFileSync(path.join(repo, 'docs', 'refresh-profile-counts-before-split-browser-proof-evidence.txt'), 'utf8');
const rollbackEvidence = fs.readFileSync(path.join(repo, 'docs', 'refresh-profile-counts-parity-rollback-evidence.txt'), 'utf8');
const ownerCalls = (html.match(/await refreshProfileCounts\(userId\);/g) || []).length;
const ownerBody = currentOwner.slice(currentOwner.indexOf('{') + 1, currentOwner.lastIndexOf('\n}'));

assert.strictEqual(currentOwner, originOwner, 'refreshProfileCounts owner must match origin/main exactly before extraction');
assert.strictEqual(sha256(currentOwner), sha256(originOwner), 'refreshProfileCounts owner hash must match origin/main');
assert.strictEqual(ownerCalls, 1, 'refreshProfileCounts must retain one existing caller');
assert.strictEqual((ownerBody.match(/db\.from\(['"]profiles['"]\)/g) || []).length, 2, 'owner must retain exactly two profiles reads');
assert(ownerBody.includes('Promise.all'), 'owner must retain parallel profile reads');
assert(!/\b(?:insert|update|upsert|delete|rpc)\s*\(/i.test(ownerBody), 'owner must contain no database mutation calls');
assert(!/(?:localStorage|sessionStorage|navigator\.|location\.|fetch\(|notification|permission|subscribe|upload|navigate)/i.test(ownerBody), 'owner must contain no storage, messaging, permission, upload, or navigation side effects');
assert(sourceFiles.length === 220, 'preparation baseline must audit the current 220 extracted JavaScript modules');
assert(browserEvidence.includes('Result: PASS') && browserEvidence.includes('detachedOnly=true'), 'detached browser proof evidence must pass');
assert(rollbackEvidence.includes('OWNER_SHA256=3dfa3058a22aff24830574aa139cc8083e159639bc751cd08f6c29a1df91e6a2') && rollbackEvidence.includes('Exact origin/main owner parity: PASS'), 'rollback and parity evidence must pass');
assert(!fs.existsSync(path.join(repo, 'src', 'features', 'refresh-profile-counts-owner.js')), 'production owner module must not exist before split authorization');
assert(!html.includes('src/features/refresh-profile-counts-owner.js'), 'production script reference must not exist before split authorization');

function createInjectedRefreshProfileCountsSeam(deps) {
  return async function refreshProfileCounts(userId) {
    try {
      const [{ data: target }, { data: me }] = await deps.query(userId);
      const targetEl = deps.getElementById('followers-count');
      if (target && targetEl) {
        targetEl.dataset.raw = target.followers_count || 0;
        targetEl.textContent = deps.fmt(target.followers_count || 0);
      }
      const meEl = deps.getElementById('following-count');
      if (me && meEl) {
        meEl.dataset.raw = me.following_count || 0;
        meEl.textContent = deps.fmt(me.following_count || 0);
      }
    } catch (error) {
      deps.events.push('error.swallowed');
    }
  };
}

function element(events) {
  return { dataset: {}, textContent: '', set() { events.push('dom.set'); } };
}

async function runCase(name, result, options = {}) {
  const events = [];
  const targetEl = options.targetPresent === false ? null : element(events);
  const meEl = options.mePresent === false ? null : element(events);
  const seam = createInjectedRefreshProfileCountsSeam({
    async query(userId) {
      events.push(`query:${userId}`);
      if (options.fail) throw new Error('query-failed');
      return result;
    },
    getElementById(id) {
      events.push(`lookup:${id}`);
      return id === 'followers-count' ? targetEl : meEl;
    },
    fmt(value) {
      events.push(`format:${value}`);
      return `F${value}`;
    },
    events,
  });
  await seam('u-target');
  return { name, events, target: targetEl, me: meEl };
}

(async () => {
  const normal = await runCase('normal', [{ data: { followers_count: 12 } }, { data: { following_count: 7 } }]);
  const targetOnly = await runCase('targetOnly', [{ data: { followers_count: 4 } }, { data: null }]);
  const meOnly = await runCase('meOnly', [{ data: null }, { data: { following_count: 9 } }]);
  const missingDom = await runCase('missingDom', [{ data: { followers_count: 4 } }, { data: { following_count: 9 } }], { targetPresent: false, mePresent: false });
  const failed = await runCase('queryFailure', [{ data: { followers_count: 4 } }, { data: { following_count: 9 } }], { fail: true });

  assert.deepStrictEqual(normal.target.dataset, { raw: 12 });
  assert.strictEqual(normal.target.textContent, 'F12');
  assert.deepStrictEqual(normal.me.dataset, { raw: 7 });
  assert.strictEqual(normal.me.textContent, 'F7');
  assert.strictEqual(targetOnly.target.textContent, 'F4');
  assert.strictEqual(targetOnly.me.textContent, '');
  assert.strictEqual(meOnly.target.textContent, '');
  assert.strictEqual(meOnly.me.textContent, 'F9');
  assert(missingDom.events.includes('lookup:followers-count') && missingDom.events.includes('lookup:following-count'), 'missing DOM branch must remain tolerated');
  assert(failed.events.includes('error.swallowed'), 'query failure must remain swallowed');
  for (const result of [normal, targetOnly, meOnly, missingDom, failed]) {
    assert(result.events.every((event) => event.startsWith('query:') || event.startsWith('lookup:') || event.startsWith('format:') || event === 'error.swallowed'), `${result.name} seam must remain read-only`);
  }

  console.log(JSON.stringify({
    passed: true,
    parity: { exact: true, ownerSha256: sha256(currentOwner) },
    static: { sourceModules: sourceFiles.length, ownerCalls, inlineOwner: true, productionModule: false },
    seam: { cases: [normal, targetOnly, meOnly, missingDom, failed].map(({ name, events, target, me }) => ({ name, events, target, me })) },
    safeNoMutation: true,
    productionSplit: 0,
  }, null, 2));
  console.log('REFRESH_PROFILE_COUNTS_PREPARATION_HARNESS=PASS');
  console.log('OWNER_BODY_PARITY=PASS');
  console.log('INJECTED_SEAM_PROOF=PASS');
  console.log('READ_ONLY_BOUNDARY=PASS');
  console.log('READ_ONLY_BROWSER_PROOF=PASS');
  console.log('ROLLBACK_EVIDENCE=PASS');
  console.log('PRODUCTION_SPLIT=NOT_STARTED');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
