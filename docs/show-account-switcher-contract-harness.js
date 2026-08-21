const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'show-account-switcher.js'), 'utf8');
const remover = fs.readFileSync(path.join(repo, 'src', 'features', 'remove-account-from-switcher.js'), 'utf8');

for (const marker of [
  'async function showAccountSwitcher()',
  'await syncCurrentAccountToSavedList()',
  'const accounts = getSavedAccounts()',
  "const m = modal('Switch Account')",
  'const isCurrent = acc.userId === ME?.id',
  'switchToAccount(\'${acc.userId}\')',
  'event.stopPropagation();removeAccountFromSwitcher(\'${acc.userId}\')',
  'Current',
  'closeModal();addNewAccount()',
  'body.innerHTML = html'
]) {
  assert(source.includes(marker), `Show account switcher marker missing: ${marker}`);
}
assert(remover.includes('function removeAccountFromSwitcher(userId)'), 'Account switcher must retain the removal delegation target');
assert(!source.includes('localStorage'), 'Show account switcher must not own saved-session storage');
assert(!source.includes('supabase'), 'Show account switcher must not own authentication data access');
assert.strictEqual((source.match(/async function showAccountSwitcher\(/g) || []).length, 1, 'Show account switcher must have one module owner');

console.log('SHOW_ACCOUNT_SWITCHER_CONTRACT_HARNESS=PASS');
console.log('SYNC_READ_CURRENT_BRANCH_SWITCH_REMOVE_ADD_ACCOUNT_MODAL_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/show-account-switcher.js');
console.log('PRODUCTION_CHANGE=0');
