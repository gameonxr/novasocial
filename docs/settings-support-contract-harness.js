const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'settings-support.js'), 'utf8');

for (const marker of [
  'function showSettingsSupport()',
  "modal('Support')",
  "m.querySelector('#mbody').innerHTML",
  'class="nova-setting-row"',
  'Ask Nova AI',
  'Help Center',
  'Report Problem',
  'Terms of Service',
  'Privacy Policy',
  'About NovaSocial',
  'closeModal();toggleNovaAI()',
  'showHelpCenter()',
  'showReportProblem()',
  "toast('Terms of Service')",
  "toast('Privacy Policy')",
  'showAbout()'
]) {
  assert(source.includes(marker), `Settings support marker missing: ${marker}`);
}
assert.strictEqual((source.match(/class="nova-setting-row"/g) || []).length, 6, 'Support settings must render six rows');
assert.strictEqual((source.match(/toggleNovaAI\(\)/g) || []).length, 1, 'Ask Nova AI must have one delegate');
assert.strictEqual((source.match(/showHelpCenter\(\)/g) || []).length, 1, 'Help Center must have one delegate');
assert.strictEqual((source.match(/showReportProblem\(\)/g) || []).length, 1, 'Report Problem must have one delegate');
assert.strictEqual((source.match(/showAbout\(\)/g) || []).length, 1, 'About must have one delegate');
assert.strictEqual((source.match(/toast\(/g) || []).length, 2, 'Policy rows must provide two toast-only actions');
assert(!source.includes('fetch('), 'Settings support must not own network requests');
assert(!source.includes('supabase'), 'Settings support must not own persistence');

console.log('SETTINGS_SUPPORT_CONTRACT_HARNESS=PASS');
console.log('MODAL_TITLE_SIX_ROWS_SUPPORT_DELEGATES_TOAST_POLICY_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/settings-support.js');
console.log('PRODUCTION_CHANGE=0');
