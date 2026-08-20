const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const switcher = fs.readFileSync(path.join(repo, 'src', 'features', 'show-account-switcher.js'), 'utf8');
const switchAccount = fs.readFileSync(path.join(repo, 'src', 'features', 'switch-to-account.js'), 'utf8');
const removal = fs.readFileSync(path.join(repo, 'src', 'features', 'remove-account-from-switcher.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

const switcherMarkers = [
  'async function showAccountSwitcher()',
  'await syncCurrentAccountToSavedList()',
  'const accounts = getSavedAccounts()',
  "modal('Switch Account')",
  'acc.userId === ME?.id',
  "switchToAccount('${acc.userId}')",
  "removeAccountFromSwitcher('${acc.userId}')",
  'event.stopPropagation()',
  'addNewAccount()',
  'body.innerHTML = html'
];
for (const marker of switcherMarkers) {
  assert(switcher.includes(marker), `Account switcher marker missing: ${marker}`);
}
const switchMarkers = [
  'async function switchToAccount(userId)',
  'const accounts = getSavedAccounts()',
  'const target = accounts.find(a => a.userId === userId)',
  "toast('Account nahi mila')",
  "db.auth.setSession({",
  'access_token: target.access_token',
  'refresh_token: target.refresh_token',
  'closeModal()',
  'window.location.reload()',
  "toast('Switch fail hua, dobara login karna padega')",
  'removeAccountSession(userId)'
];
for (const marker of switchMarkers) {
  assert(switchAccount.includes(marker), `Account switch marker missing: ${marker}`);
}
const removalMarkers = [
  'function removeAccountFromSwitcher(userId)',
  'userId === ME?.id',
  "toast('Current account remove nahi kar sakte, pehle switch karo')",
  'removeAccountSession(userId)',
  'showAccountSwitcher()'
];
for (const marker of removalMarkers) {
  assert(removal.includes(marker), `Account removal marker missing: ${marker}`);
}
assert(html.includes('src/features/show-account-switcher.js'), 'Account switcher module must remain linked from HTML');
assert(html.includes('src/features/switch-to-account.js'), 'Account switch module must remain linked from HTML');
assert(html.includes('src/features/remove-account-from-switcher.js'), 'Account removal module must remain linked from HTML');
assert.strictEqual((switcher.match(/function showAccountSwitcher\(/g) || []).length, 1, 'Account switcher must have one module owner');
assert.strictEqual((switchAccount.match(/function switchToAccount\(/g) || []).length, 1, 'Account switch must have one module owner');

console.log('ACCOUNT_SWITCHER_RENDERING_CONTRACT_HARNESS=PASS');
console.log('SYNC_CURRENT_GUARD_SWITCH_REMOVE_ADD_ACCOUNT_FAILURE=LOCKED');
console.log('PRODUCTION_CHANGE=0');
