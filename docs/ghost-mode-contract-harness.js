const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'toggle-ghost-mode.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

const requiredMarkers = [
  'async function toggleGhostMode()',
  'const newMode = !(PROF?.ghost_mode || false)',
  "update({ ghost_mode: newMode }).eq('id', ME.id)",
  'PROF.ghost_mode = newMode',
  "document.getElementById('ghost-status').innerText",
  "newMode ? 'ON 🟢' : 'OFF 🔴'",
  "newMode ? 'Ghost Mode Activated 👻' : 'Ghost Mode Deactivated'"
];
for (const marker of requiredMarkers) {
  assert(source.includes(marker), `Ghost Mode marker missing: ${marker}`);
}
assert(html.includes('src/features/toggle-ghost-mode.js'), 'Ghost Mode module must remain linked from HTML');
assert(!source.includes('go('), 'Ghost Mode helper must not own navigation');
assert(!source.includes('setSession'), 'Ghost Mode helper must not own authentication');
assert.strictEqual((source.match(/function toggleGhostMode\(/g) || []).length, 1, 'Ghost Mode helper must have one module owner');

console.log('GHOST_MODE_CONTRACT_HARNESS=PASS');
console.log('INVERT_PERSIST_LOCAL_STATE_STATUS_TOAST=LOCKED');
console.log('MODULE_OWNER=src/features/toggle-ghost-mode.js');
console.log('PRODUCTION_CHANGE=0');
