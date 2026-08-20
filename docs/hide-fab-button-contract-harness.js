const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'hide-fab-button.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

for (const marker of [
  'function hideFabButton()',
  "document.getElementById('fab-main')",
  "fab.style.display = 'none'",
  "localStorage.setItem('nova-fab-hidden', 'true')",
  'closeFabLongPressMenu()',
  "toast('Upload shortcut hidden. Long press Home icon to restore.')"
]) {
  assert(source.includes(marker), `Hide FAB button marker missing: ${marker}`);
}
assert(html.includes('src/features/hide-fab-button.js'), 'Hide FAB button module must remain linked from HTML');
assert(!source.includes('fetch('), 'Hide FAB button must not own network requests');
assert(!source.includes('supabase'), 'Hide FAB button must not own remote data access');
assert.strictEqual((source.match(/function hideFabButton\(/g) || []).length, 1, 'Hide FAB button must have one module owner');

console.log('HIDE_FAB_BUTTON_CONTRACT_HARNESS=PASS');
console.log('GUARD_DISPLAY_HIDE_LOCAL_MARKER_MENU_CLEANUP_TOAST_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/hide-fab-button.js');
console.log('PRODUCTION_CHANGE=0');
