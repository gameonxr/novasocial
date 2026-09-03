'use strict';

const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const repo = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const originHtml = execFileSync('git', ['show', 'origin/main:index.html'], { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
const moduleText = fs.readFileSync(path.join(repo, 'src', 'features', 'set-verify-filter-owner.js'), 'utf8');
const signature = 'function setVerifyFilter(f){';
const endSignature = '\nasync function loadVerifyList()';

function extractOwner(text) {
  const start = text.indexOf(signature);
  const end = text.indexOf(endSignature, start);
  assert(start >= 0 && end > start, 'setVerifyFilter owner boundary must exist');
  return text.slice(start, end);
}

const originOwner = extractOwner(originHtml).replace(/\n$/, '');
const moduleOwnerStart = moduleText.indexOf('window.setVerifyFilter = function(f){');
assert(moduleOwnerStart >= 0, 'external setVerifyFilter owner must exist');
const moduleOwner = moduleText.slice(moduleOwnerStart).replace('window.setVerifyFilter = function(f){', signature, 1).replace(/\n};\n$/, '\n}');
const sha256 = text => crypto.createHash('sha256').update(text).digest('hex');
const body = moduleOwner.slice(moduleOwner.indexOf('{') + 1, moduleOwner.lastIndexOf('\n}'));
const sourceFiles = execFileSync('find', [path.join(repo, 'src'), '-type', 'f', '-name', '*.js'], { encoding: 'utf8' }).trim().split('\n').filter(Boolean);

assert.strictEqual(moduleOwner, originOwner, 'normalized external owner must match immutable origin/main exactly');
assert.strictEqual(sha256(originOwner), 'a22a86b644df9efe16c59b6bcf828b97752140b37309fec4fa3aee06ac6a6be6', 'normalized origin owner hash must match the recorded anchor');
assert.strictEqual(sourceFiles.length, 238, 'after-split audit must include 234 extracted JavaScript modules after the DMs renderer split');
assert.strictEqual((html.match(/function setVerifyFilter\(f\)\{/g) || []).length, 0, 'inline setVerifyFilter owner must be absent');
assert.strictEqual((moduleText.match(/window\.setVerifyFilter\s*=\s*function\(f\)\s*\{/g) || []).length, 1, 'external setVerifyFilter owner must occur once');
assert.strictEqual((html.match(/src\/features\/set-verify-filter-owner\.js/g) || []).length, 1, 'verification filter module must be linked exactly once');
assert.strictEqual((html.match(/onclick="setVerifyFilter\('/g) || []).length, 4, 'four verification filter controls must remain');
assert.strictEqual((html.match(/<script\b/gi) || []).length, 240, '236 script tags must remain after the DMs renderer split');
assert.strictEqual((html.match(/<\/script>/gi) || []).length, 240, '233 script closures must remain after the DMs renderer split');
assert.strictEqual((html.match(/<script\s+src=/gi) || []).length, 239, '234 external scripts must remain after the DMs renderer split');
assert(html.indexOf('src/features/set-reports-filter-owner.js') < html.indexOf('src/features/set-verify-filter-owner.js'), 'verification filter module must load after reports filter owner');
assert(html.indexOf('src/features/set-verify-filter-owner.js') < html.indexOf('src/features/refresh-profile-counts-owner.js'), 'verification filter module must load before refresh-counts owner');
assert(body.includes('_verifyFilter=f'), 'external owner must preserve verification filter state assignment');
assert(body.includes("document.getElementById('vf-'+x)"), 'external owner must preserve verification filter control lookup');
assert(body.includes('loadVerifyList();'), 'external owner must preserve delegated verification-list reload');
assert(!/\b(?:insert|update|upsert|delete|rpc)\s*\(/i.test(body), 'external owner must contain no database mutation calls');
assert(!/(?:db\.|localStorage|sessionStorage|navigator\.|location\.|fetch\(|notification|permission|upload|navigate|adminApproveVerify|adminRejectVerify|verification_requests)/i.test(body), 'external owner must contain no database, storage, messaging, navigation, or verification-action side effects');
assert(!/<script\b[^>]*\b(?:type|defer|async)\s*=/i.test(html), 'all application scripts must remain classic');
const afterEvidence = fs.readFileSync(path.join(repo, 'docs', 'set-verify-filter-after-split-browser-proof-evidence.txt'), 'utf8');
const rollbackEvidence = fs.readFileSync(path.join(repo, 'docs', 'set-verify-filter-parity-rollback-evidence.txt'), 'utf8');
assert(afterEvidence.includes('RESULT=PASS') && afterEvidence.includes('ownerInvoked=false') && afterEvidence.includes('detachedOnly=true'), 'after-split browser proof must pass');
assert(rollbackEvidence.includes('NORMALIZED_ORIGIN_PARITY=PASS'), 'rollback evidence must preserve parity');
assert(rollbackEvidence.includes('PRE_SPLIT_BRANCH2_SHA=788655c7ef91eaf9c93f66f6d4f01d83c679d4f5'), 'rollback evidence must retain the pinned pre-split baseline');

function runSyntheticCase(selected, missingControl) {
  const names = ['pending', 'approved', 'rejected', 'all'];
  const controls = new Map(names.map(name => [name, { style: {} }]));
  const events = [];
  const syntheticDocument = {
    getElementById(id) {
      events.push(`lookup:${id}`);
      if (missingControl && id === 'vf-rejected') return null;
      return controls.get(id.slice(3)) || null;
    },
  };
  const owner = Function('document', 'events', `let _verifyFilter = 'pending'; const loadVerifyList = () => events.push('reload'); return (${moduleOwner});`)(syntheticDocument, events);
  owner(selected);
  return { controls, events };
}

const expectedColors = { pending: '#3897f0', approved: '#3db83d', rejected: '#ff4444', all: '#a855f7' };
for (const selected of ['pending', 'approved', 'rejected', 'all']) {
  const { controls, events } = runSyntheticCase(selected, false);
  assert.strictEqual(controls.get(selected).style.color, expectedColors[selected], `${selected} filter must receive selected color`);
  assert.strictEqual(controls.get(selected).style.border, `1px solid ${expectedColors[selected]}`, `${selected} filter must receive selected border`);
  const reset = controls.get(['pending', 'approved', 'rejected', 'all'].find(name => name !== selected));
  assert.strictEqual(reset.style.color, '#8A8A8A', `${selected} case must reset unselected controls`);
  assert.deepStrictEqual(events.slice(-1), ['reload'], `${selected} case must delegate exactly one reload`);
}
const missing = runSyntheticCase('rejected', true);
assert(missing.events.includes('reload'), 'missing verification control must not prevent reload delegation');
console.log('SET_VERIFY_FILTER_PRODUCTION_SPLIT_HARNESS=PASS');
console.log('EXACT_ORIGIN_OWNER_PARITY=PASS');
console.log(`NORMALIZED_OWNER_SHA256=${sha256(originOwner)}`);
console.log(`SOURCE_MODULES=${sourceFiles.length}`);
console.log('FILTER_CASES=4');
console.log('MISSING_CONTROL_TOLERANCE=PASS');
console.log('STATEFUL_BOUNDARIES=ABSENT');
console.log('INLINE_OWNER=ABSENT');
console.log('EXTERNAL_OWNER=ONE_ANONYMOUS_WINDOW_ASSIGNMENT');
console.log('READ_ONLY_BROWSER_PROOF=PASS');
console.log('ROLLBACK_EVIDENCE=PINNED');
console.log('PRODUCTION_SPLIT=COMPLETE');
