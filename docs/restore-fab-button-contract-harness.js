const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'restore-fab-button.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

for (const marker of [
  'function restoreFabButton()',
  "document.getElementById('fab-main')",
  'if(fab)',
  "fab.style.display = 'flex'",
  "fab.style.animation = 'novaScaleIn 0.4s ease'",
  "localStorage.setItem('nova-fab-hidden', 'false')",
  "if(curTab === 'home')",
  "toast('Upload Button Restored')"
]) {
  assert(source.includes(marker), `Restore FAB button marker missing: ${marker}`);
}
assert(html.includes('src/features/restore-fab-button.js'), 'Restore FAB button module must remain linked from HTML');
assert(!source.includes('fetch('), 'Restore FAB button must not own network requests');
assert(!source.includes('supabase'), 'Restore FAB button must not own remote data access');
assert.strictEqual((source.match(/function restoreFabButton\(/g) || []).length, 1, 'Restore FAB button must have one module owner');

console.log('RESTORE_FAB_BUTTON_CONTRACT_HARNESS=PASS');
console.log('GUARD_DISPLAY_ANIMATION_LOCAL_MARKER_HOME_TOAST_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/restore-fab-button.js');
console.log('PRODUCTION_CHANGE=0');
