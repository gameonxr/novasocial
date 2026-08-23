'use strict';

const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const repo = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const originHtml = execFileSync('git', ['show', 'origin/main:index.html'], { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
const signature = 'function setVerifyFilter(f){';
const endSignature = '\nasync function loadVerifyList()';

function extractOwner(text) {
  const start = text.indexOf(signature);
  const end = text.indexOf(endSignature, start);
  assert(start >= 0 && end > start, 'setVerifyFilter owner boundary must exist');
  return text.slice(start, end);
}

const originOwner = extractOwner(originHtml);
const currentOwner = extractOwner(html);
const sha256 = text => crypto.createHash('sha256').update(text).digest('hex');
const body = currentOwner.slice(currentOwner.indexOf('{') + 1, currentOwner.lastIndexOf('\n}'));

assert.strictEqual(currentOwner, originOwner, 'pre-split setVerifyFilter owner must match immutable origin/main exactly');
assert.strictEqual(sha256(originOwner), 'ba13b4efd91ff679b2c7e5ac88fe3e67321beebd671cd1ca5845a8a8cfc15eda', 'origin owner hash must match the recorded preparation anchor');
assert.strictEqual((html.match(/function setVerifyFilter\(f\)\{/g) || []).length, 1, 'inline setVerifyFilter owner must occur exactly once before split');
assert.strictEqual((html.match(/src\/features\/set-verify-filter-owner\.js/g) || []).length, 0, 'verification filter owner module must not be linked before split');
assert.strictEqual((html.match(/onclick="setVerifyFilter\('/g) || []).length, 4, 'four verification filter controls must call setVerifyFilter');
assert(body.includes('_verifyFilter=f'), 'owner must preserve verification filter state assignment');
assert(body.includes("document.getElementById('vf-'+x)"), 'owner must preserve verification filter control lookup');
assert(body.includes('loadVerifyList();'), 'owner must preserve delegated verification-list reload');
assert(!/\b(?:insert|update|upsert|delete|rpc)\s*\(/i.test(body), 'owner must contain no database mutation calls');
assert(!/(?:db\.|localStorage|sessionStorage|navigator\.|location\.|fetch\(|notification|permission|upload|navigate|adminApproveVerify|adminRejectVerify|verification_requests)/i.test(body), 'owner must contain no database, storage, messaging, navigation, or verification-action side effects');
assert(!/<script\b[^>]*\b(?:type|defer|async)\s*=/i.test(html), 'classic-script production boundary must not introduce module, defer, or async script attributes');

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
  const owner = Function('document', 'events', `let _verifyFilter = 'pending'; const loadVerifyList = () => events.push('reload'); return (${currentOwner});`)(syntheticDocument, events);
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
console.log('SET_VERIFY_FILTER_PREPARATION_HARNESS=PASS');
console.log('EXACT_ORIGIN_OWNER_PARITY=PASS');
console.log(`OWNER_SHA256=${sha256(originOwner)}`);
console.log('FILTER_CASES=4');
console.log('MISSING_CONTROL_TOLERANCE=PASS');
console.log('STATEFUL_BOUNDARIES=ABSENT');
console.log('PRE_SPLIT_INLINE_OWNER=ONE');
console.log('PRODUCTION_SPLIT=0');
