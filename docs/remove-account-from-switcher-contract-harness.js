const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'remove-account-from-switcher.js'), 'utf8');
const accountSession = fs.readFileSync(path.join(repo, 'src', 'features', 'show-account-switcher.js'), 'utf8');

for (const marker of [
  'function removeAccountFromSwitcher(userId)',
  'if(userId === ME?.id)',
  "toast('Current account remove nahi kar sakte, pehle switch karo')",
  'return;',
  'removeAccountSession(userId)',
  'showAccountSwitcher();'
]) {
  assert(source.includes(marker), `Remove account switcher marker missing: ${marker}`);
}
assert(accountSession.includes('function showAccountSwitcher()'), 'Removal helper must retain the account-switcher refresh target');
assert(!source.includes('localStorage'), 'Remove account helper must not own session storage');
assert(!source.includes('supabase'), 'Remove account helper must not own authentication data access');
assert.strictEqual((source.match(/function removeAccountFromSwitcher\(/g) || []).length, 1, 'Remove account helper must have one module owner');

console.log('REMOVE_ACCOUNT_FROM_SWITCHER_CONTRACT_HARNESS=PASS');
console.log('CURRENT_ACCOUNT_GUARD_TOAST_EARLY_RETURN_REMOVE_REFRESH_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/remove-account-from-switcher.js');
console.log('PRODUCTION_CHANGE=0');
