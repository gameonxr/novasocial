const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'add-new-account.js'), 'utf8');

for (const marker of [
  'function addNewAccount()',
  'const accounts = getSavedAccounts()',
  'if(accounts.length >= MAX_ACCOUNTS)',
  'toast(`Max ${MAX_ACCOUNTS} accounts allowed`)',
  'window._addingNewAccount = true',
  'ME = null',
  'PROF = null',
  'resetAccountScopedUiState(null)',
  "document.getElementById('root').style.display='none'",
  "document.getElementById('auth').style.display='flex'",
  "setMode('login')",
  "toast('Naya account login karo')"
]) {
  assert(source.includes(marker), `Add new account marker missing: ${marker}`);
}
assert(!source.includes('fetch('), 'Add new account must not own network requests');
assert(!source.includes('signIn'), 'Add new account must not submit authentication');
assert.strictEqual((source.match(/function addNewAccount\(/g) || []).length, 1, 'Add new account must have one module owner');

console.log('ADD_NEW_ACCOUNT_CONTRACT_HARNESS=PASS');
console.log('CAP_GUARD_MARKER_IDENTITY_RESET_UI_AUTH_TRANSITION_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/add-new-account.js');
console.log('PRODUCTION_CHANGE=0');
