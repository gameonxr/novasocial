const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'report-user.js'), 'utf8');

for (const marker of [
  'function reportUser(userId)',
  "showReportModal('user', userId)",
  'showReportModal('
]) {
  assert(source.includes(marker), `Report-user marker missing: ${marker}`);
}
assert.strictEqual((source.match(/showReportModal\(/g) || []).length, 1, 'Report-user must delegate exactly once');
assert(!source.includes('fetch('), 'Report-user must not own report submission requests');
assert(!source.includes('innerHTML'), 'Report-user must not own report modal rendering');
assert(!source.includes('supabase'), 'Report-user must not own persistence');

console.log('REPORT_USER_CONTRACT_HARNESS=PASS');
console.log('SIGNATURE_TARGET_TYPE_ARGUMENT_FORWARDING_SINGLE_DELEGATION_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/report-user.js');
console.log('PRODUCTION_CHANGE=0');
