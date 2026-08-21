const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'settings-appearance.js'), 'utf8');

for (const marker of [
  'function showSettingsAppearance()',
  "modal('Appearance')",
  "m.querySelector('#mbody').innerHTML",
  'class="nova-setting-row"',
  'Themes',
  'Profile Themes',
  'Gradient Packs',
  'Premium Customization',
  'showThemePickerModal()',
  'showProfileCustomizer()'
]) {
  assert(source.includes(marker), `Settings appearance marker missing: ${marker}`);
}
assert.strictEqual((source.match(/class="nova-setting-row"/g) || []).length, 4, 'Appearance settings must render four rows');
assert.strictEqual((source.match(/showThemePickerModal\(\)/g) || []).length, 2, 'Themes and Gradient Packs must use the theme picker');
assert.strictEqual((source.match(/showProfileCustomizer\(\)/g) || []).length, 2, 'Profile Themes and Premium Customization must use the profile customizer');
assert(!source.includes('fetch('), 'Settings appearance must not own network requests');
assert(!source.includes('supabase'), 'Settings appearance must not own persistence');

console.log('SETTINGS_APPEARANCE_CONTRACT_HARNESS=PASS');
console.log('MODAL_TITLE_FOUR_ROWS_THEME_CUSTOMIZER_DELEGATES_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/settings-appearance.js');
console.log('PRODUCTION_CHANGE=0');
