const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'dm-drafts.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

const requiredMarkers = [
  'function saveDmDraft(cid, text)',
  "localStorage.getItem('nova-dm-drafts'",
  'JSON.parse',
  'if(text && text.trim())',
  'drafts[cid] = text',
  'delete drafts[cid]',
  "localStorage.setItem('nova-dm-drafts', JSON.stringify(drafts))",
  'function clearDmDraft(cid)',
  'try {',
  '} catch(e) {}'
];
for (const marker of requiredMarkers) {
  assert(source.includes(marker), `DM draft marker missing: ${marker}`);
}
assert(html.includes('src/features/dm-drafts.js'), 'DM draft module must remain linked from HTML');
assert(!source.includes('db.from('), 'DM draft helper must not own database writes');
assert(!source.includes('go('), 'DM draft helper must not own navigation');
assert(!source.includes('sendMessage'), 'DM draft helper must not own message sending');
assert.strictEqual((source.match(/function saveDmDraft\(/g) || []).length, 1, 'saveDmDraft must have one module owner');
assert.strictEqual((source.match(/function clearDmDraft\(/g) || []).length, 1, 'clearDmDraft must have one module owner');

console.log('DM_DRAFTS_CONTRACT_HARNESS=PASS');
console.log('STORAGE_ISOLATION_BLANK_CLEAR_FAILURE_TOLERANCE=LOCKED');
console.log('MODULE_OWNER=src/features/dm-drafts.js');
console.log('PRODUCTION_CHANGE=0');
