const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'show-report-modal.js'), 'utf8');

for (const marker of [
  'function showReportModal(targetType, targetId)',
  'closeModal()',
  "modal('Report')",
  "m.querySelector('#mbody')",
  'esc(targetType)',
  'REPORT_REASONS.map((r, i) =>',
  'data-reason-idx="${i}"',
  'data-reason-key="${r.key}"',
  'report-reason-item',
  "onclick=\"closeModal()\"",
  "addEventListener('mouseenter'",
  "addEventListener('mouseleave'",
  "addEventListener('click'",
  'submitReport(targetType, targetId, reasonKey)',
  "addEventListener('touchend'",
  'e.preventDefault()'
]) {
  assert(source.includes(marker), `Report modal marker missing: ${marker}`);
}
assert.strictEqual((source.match(/submitReport\(targetType, targetId, reasonKey\)/g) || []).length, 2, 'Report modal must delegate from mouse and touch paths');
assert.strictEqual((source.match(/addEventListener\('mouseenter'/g) || []).length, 1, 'Report modal must retain hover-enter behavior');
assert.strictEqual((source.match(/addEventListener\('mouseleave'/g) || []).length, 1, 'Report modal must retain hover-leave behavior');
assert.strictEqual((source.match(/addEventListener\('click'/g) || []).length, 1, 'Report modal must retain click delegation');
assert.strictEqual((source.match(/addEventListener\('touchend'/g) || []).length, 1, 'Report modal must retain touch delegation');
assert(!source.includes('fetch('), 'Report modal renderer must not own network requests');
assert(!source.includes('supabase'), 'Report modal renderer must not own persistence');
assert(source.includes('submitReport('), 'Report persistence must remain an explicit delegated boundary');

console.log('SHOW_REPORT_MODAL_CONTRACT_HARNESS=PASS');
console.log('LIFECYCLE_ESCAPED_TARGET_REASON_LIST_CANCEL_HOVER_MOUSE_TOUCH_DELEGATION_INLINE_PERSISTENCE_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/show-report-modal.js');
console.log('PRODUCTION_CHANGE=0');
