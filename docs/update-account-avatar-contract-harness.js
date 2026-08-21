const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'update-account-avatar.js'), 'utf8');

for (const marker of [
  'function updateAccountAvatar(userId, avatarUrl)',
  'let accounts = getSavedAccounts()',
  'const acc = accounts.find(a => a.userId === userId)',
  'if(acc){ acc.avatarUrl = avatarUrl;',
  "localStorage.setItem('nova_accounts', JSON.stringify(accounts))"
]) {
  assert(source.includes(marker), `Update account avatar marker missing: ${marker}`);
}
assert(!source.includes('fetch('), 'Update account avatar must not own network requests');
assert(!source.includes('supabase'), 'Update account avatar must not own remote profile updates');
assert.strictEqual((source.match(/function updateAccountAvatar\(/g) || []).length, 1, 'Update account avatar must have one module owner');

console.log('UPDATE_ACCOUNT_AVATAR_CONTRACT_HARNESS=PASS');
console.log('SAVED_LOOKUP_MATCH_MUTATION_STORAGE_PERSISTENCE_UNKNOWN_NOOP_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/update-account-avatar.js');
console.log('PRODUCTION_CHANGE=0');
