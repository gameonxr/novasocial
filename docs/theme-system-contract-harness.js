const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'theme-system.js'), 'utf8');

for (const marker of [
  'function toggleThemePicker()',
  "document.getElementById('theme-panel')",
  "classList.toggle('show')",
  'function setTheme(theme, el)',
  "removeAttribute('data-theme')",
  "setAttribute('data-theme', theme)",
  "localStorage.setItem('nova-theme', theme)",
  "document.querySelectorAll('.theme-opt')",
  "o.querySelector('.theme-opt-swatch')",
  "setTimeout(()=>{document.getElementById('theme-panel')?.classList.remove('show');}, 300)",
  'function loadSavedTheme()',
  "localStorage.getItem('nova-theme')"
]) {
  assert(source.includes(marker), `Theme system marker missing: ${marker}`);
}
assert.strictEqual((source.match(/removeAttribute\('data-theme'\)/g) || []).length, 2, 'Theme selection must reset root and body themes');
assert.strictEqual((source.match(/setAttribute\('data-theme', theme\)/g) || []).length, 2, 'Theme selection must apply the selected theme to root and body');
assert.strictEqual((source.match(/setAttribute\('data-theme', t\)/g) || []).length, 2, 'Saved-theme restoration must apply the stored theme to root and body');
assert.strictEqual((source.match(/localStorage\.(setItem|getItem)\('nova-theme'/g) || []).length, 2, 'Theme storage must have one write and one read');
assert(source.includes("theme !== 'default'"), 'Theme application must preserve the default-theme reset path');
assert(source.includes("t !== 'default'"), 'Saved-theme restoration must ignore the default sentinel');
assert(!source.includes('fetch('), 'Theme system must not own network requests');
assert(!source.includes('supabase'), 'Theme system must not own remote persistence');

console.log('THEME_SYSTEM_CONTRACT_HARNESS=PASS');
console.log('PANEL_TOGGLE_THEME_ATTRIBUTES_STORAGE_OPTION_HIGHLIGHT_DELAYED_CLOSE_RESTORE_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/theme-system.js');
console.log('PRODUCTION_CHANGE=0');
