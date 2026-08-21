const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'switch-admin-tab.js'), 'utf8');

for (const marker of [
  'function switchAdminTab(tab)',
  "document.querySelectorAll('.admin-tab')",
  '.forEach(t => {',
  't.dataset.tab === tab',
  "t.style.background='rgba(255,45,122,0.15)'",
  "t.style.border='1px solid #FF2D7A'",
  "t.style.color='#FF2D7A'",
  "t.style.background='rgba(255,255,255,0.04)'",
  "t.style.border='1px solid rgba(255,255,255,0.06)'",
  "t.style.color='#8A8A8A'",
  'loadAdminTab(tab)'
]) {
  assert(source.includes(marker), `Switch admin tab marker missing: ${marker}`);
}
assert.strictEqual((source.match(/loadAdminTab\(/g) || []).length, 1, 'Switch admin tab must delegate exactly once');
assert(!source.includes('fetch('), 'Switch admin tab must not own data loading');
assert(!source.includes('supabase'), 'Switch admin tab must not own persistence');
assert(!source.includes('delete'), 'Switch admin tab must not own destructive admin operations');

console.log('SWITCH_ADMIN_TAB_CONTRACT_HARNESS=PASS');
console.log('FULL_ITERATION_ACTIVE_INACTIVE_STYLES_SINGLE_DELEGATION_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/switch-admin-tab.js');
console.log('PRODUCTION_CHANGE=0');
