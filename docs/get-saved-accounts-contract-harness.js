const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'get-saved-accounts.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

for (const marker of [
  'function getSavedAccounts()',
  'try{',
  "JSON.parse(localStorage.getItem('nova_accounts')||'[]')",
  'catch(e){ return []; }'
]) {
  assert(source.includes(marker), `Get saved accounts marker missing: ${marker}`);
}
assert(html.includes('src/features/get-saved-accounts.js'), 'Get saved accounts module must remain linked from HTML');
assert(!source.includes('fetch('), 'Get saved accounts must not own network requests');
assert(!source.includes('supabase'), 'Get saved accounts must not own remote data access');
assert(!source.includes('signIn'), 'Get saved accounts must not own authentication');
assert.strictEqual((source.match(/function getSavedAccounts\(/g) || []).length, 1, 'Get saved accounts must have one module owner');

console.log('GET_SAVED_ACCOUNTS_CONTRACT_HARNESS=PASS');
console.log('LOCAL_KEY_JSON_EMPTY_ERROR_FALLBACK_ACCOUNT_LIST_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/get-saved-accounts.js');
console.log('PRODUCTION_CHANGE=0');
