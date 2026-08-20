const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'toggle-vanish-mode.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

const requiredMarkers = [
  'function toggleVanishMode()',
  'window._vanishMode = !window._vanishMode',
  "document.getElementById('vanish-btn')",
  "window._vanishMode ? '👻' : '🔓'",
  "document.getElementById('mlist')",
  'repeating-linear-gradient',
  "window._vanishMode ? 'Vanish Mode ON 👻' : 'Vanish Mode OFF'",
  'toast('
];
for (const marker of requiredMarkers) {
  assert(source.includes(marker), `Vanish Mode marker missing: ${marker}`);
}
assert(html.includes('src/features/toggle-vanish-mode.js'), 'Vanish Mode module must remain linked from HTML');
assert(!source.includes('db.from('), 'Vanish Mode helper must not own database writes');
assert(!source.includes('renderDMs'), 'Vanish Mode helper must not own protected DM rendering');
assert(!source.includes('openChat'), 'Vanish Mode helper must not own chat navigation');
assert.strictEqual((source.match(/function toggleVanishMode\(/g) || []).length, 1, 'Vanish Mode helper must have one module owner');

console.log('VANISH_MODE_CONTRACT_HARNESS=PASS');
console.log('STATE_ICON_BACKGROUND_TOAST_UI_ONLY_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/toggle-vanish-mode.js');
console.log('PRODUCTION_CHANGE=0');
