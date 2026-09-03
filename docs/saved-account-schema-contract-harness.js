const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = process.env.NOVASOCIAL_REPO || path.resolve(__dirname, "..");
function read(relative) { return fs.readFileSync(path.join(repo, relative), 'utf8'); }
const index = read('index.html');
const saveModule = read('src/features/save-account-session.js');
const getSaved = read('src/features/get-saved-accounts.js');
const switchTo = read('src/features/switch-to-account.js');
const avatar = read('src/features/update-account-avatar.js');

assert(getSaved.includes("localStorage.getItem('nova_accounts')"), 'saved-account reader must use nova_accounts');
assert(getSaved.includes("||'[]'"), 'saved-account reader must use an empty-array fallback');
assert(switchTo.includes("localStorage") === false, 'switch action must use the shared saved-account reader');
assert(switchTo.includes('access_token: target.access_token'), 'switch action must pass target access_token');
assert(switchTo.includes('refresh_token: target.refresh_token'), 'switch action must pass target refresh_token');
assert(avatar.includes('getSavedAccounts()'), 'avatar updater must use the shared saved-account reader');
assert(avatar.includes('a.userId === userId'), 'avatar updater must target the matching userId');
assert(avatar.includes('acc.avatarUrl = avatarUrl'), 'avatar updater must update avatarUrl');
assert(saveModule.includes("localStorage.setItem('nova_accounts', JSON.stringify(accounts))"), 'save module must persist nova_accounts');
assert(saveModule.includes('userId, username, avatarUrl'), 'saved-account schema must contain identity and avatar fields');
for (const field of ['access_token', 'refresh_token', 'savedAt']) {
  assert(saveModule.includes(`${field}:`), `saved-account schema must contain ${field}`);
}
assert(saveModule.includes('window.saveAccountSession = function saveAccountSession(userId, username, avatarUrl, session)'), 'saveAccountSession must be exposed as window global in save module');
assert(index.includes('async function syncCurrentAccountToSavedList()'), 'inline syncCurrentAccountToSavedList must remain present');

console.log('SAVED_ACCOUNT_SCHEMA_HARNESS=PASS');
console.log('STORAGE_KEY=nova_accounts');
console.log('RECORD_FIELDS=userId,username,avatarUrl,access_token,refresh_token,savedAt');
console.log('TOKEN_HANDOFF=access_token+refresh_token');
