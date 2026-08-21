const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'switch-to-account.js'), 'utf8');
const switcher = fs.readFileSync(path.join(repo, 'src', 'features', 'show-account-switcher.js'), 'utf8');

for (const marker of [
  'async function switchToAccount(userId)',
  'const accounts = getSavedAccounts()',
  'const target = accounts.find(a => a.userId === userId)',
  "if(!target){ toast('Account nahi mila'); return; }",
  "toast('Switching account...')",
  'db.auth.setSession({',
  'access_token: target.access_token',
  'refresh_token: target.refresh_token',
  'closeModal()',
  'setTimeout(()=>{ window.location.reload(); }, 300)',
  "toast('Switch fail hua, dobara login karna padega')",
  'removeAccountSession(userId)'
]) {
  assert(source.includes(marker), `Switch to account marker missing: ${marker}`);
}
assert(switcher.includes('switchToAccount(\'${acc.userId}\')'), 'Account switcher must retain the switch delegation target');
assert(!source.includes('localStorage'), 'Switch to account must not own saved-account storage');
assert.strictEqual((source.match(/async function switchToAccount\(/g) || []).length, 1, 'Switch to account must have one module owner');

console.log('SWITCH_TO_ACCOUNT_CONTRACT_HARNESS=PASS');
console.log('TARGET_LOOKUP_GUARD_TOKEN_HANDOFF_SUCCESS_RELOAD_FAILURE_CLEANUP_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/switch-to-account.js');
console.log('PRODUCTION_CHANGE=0');
