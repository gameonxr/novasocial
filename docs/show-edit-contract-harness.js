const assert = require('assert');
const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'features', 'show-edit.js'), 'utf8');

for (const marker of [
  'function showEdit()',
  "const m=modal('Settings')",
  "const body=m.querySelector('#mbody')",
  'body.innerHTML=',
  'PROF?.avatar_url',
  'PROF?.username||ME?.email',
  'ME?.email',
  'onclick="showSettingsAccount()"',
  'onclick="showSettingsPrivacy()"',
  'onclick="showSettingsAppearance()"',
  'onclick="showSettingsFeatures()"',
  'onclick="showSettingsNotifications()"',
  'onclick="showSettingsSupport()"',
  "PROF?.is_admin === true || PROF?.is_moderator === true",
  'onclick="showAdminPanel()"',
  "PROF?.is_super_admin ? 'Super Admin Panel'",
  "PROF?.is_admin ? 'Admin Panel' : 'Moderator Panel'",
  'onclick="logout()"',
  'NovaSocial v1.0'
]) {
  assert(source.includes(marker), `show-edit marker missing: ${marker}`);
}
assert.strictEqual((source.match(/onclick=/g) || []).length, 8, 'settings hub must retain eight navigation/action handlers');
assert.strictEqual((source.match(/nova-setting-row/g) || []).length, 7, 'settings hub must retain six standard rows and one conditional staff row');
assert(source.includes('modal(\'Settings\')'), 'show-edit must continue to use the Settings modal');
assert(source.includes("querySelector('#mbody')"), 'show-edit must continue to render into the modal body');
assert(!source.includes('db.'), 'show-edit must remain a presentation/navigation renderer');
assert(!source.includes('navigator.mediaDevices'), 'show-edit must not own media systems');

console.log('SHOW_EDIT_CONTRACT_HARNESS=PASS');
console.log('SETTINGS_HUB_MODAL_ROUTES_ROLE_GATED_ADMIN_LOGOUT_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/show-edit.js');
console.log('PRODUCTION_CHANGE=0');
