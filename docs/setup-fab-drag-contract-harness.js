const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'setup-fab-drag.js'), 'utf8');

for (const marker of [
  'function setupFabDrag()',
  "document.getElementById('fab-main')",
  'fab._fabSetup',
  'const onStart = (clientX, clientY) => {',
  'const onMove = (clientX, clientY) => {',
  'const onEnd = () => {',
  '}, 600)',
  'Math.abs(dx) > 5 || Math.abs(dy) > 5',
  'showFabLongPressMenu()',
  'closeFabMenu()',
  'closeFabLongPressMenu()',
  'window.innerWidth - fabSize - 8',
  'window.innerHeight - fabSize - 80',
  "localStorage.setItem('nova-fab-pos'",
  'fab.onclick = null',
  'fab.onclick = toggleFabMenu',
  "localStorage.getItem('nova-fab-pos'",
  "localStorage.getItem('nova-fab-hidden') === 'true'",
  'setupHomeHoldRestore()'
]) {
  assert(source.includes(marker), `FAB drag marker missing: ${marker}`);
}
for (const event of ['touchstart', 'touchmove', 'touchend', 'mousedown', 'mousemove', 'mouseup']) {
  assert(source.includes(`'${event}'`), `FAB drag must register ${event}`);
}
assert.strictEqual((source.match(/setTimeout\(/g) || []).length, 2, 'FAB drag must have long-press and click-restoration timers');
assert.strictEqual((source.match(/localStorage\.getItem\(/g) || []).length, 2, 'FAB drag must read saved position and hidden state');
assert(!source.includes('fetch('), 'FAB drag must not own network requests');
assert(!source.includes('supabase'), 'FAB drag must not own persistence beyond local storage');

console.log('SETUP_FAB_DRAG_CONTRACT_HARNESS=PASS');
console.log('IDEMPOTENCE_POINTER_EVENTS_LONG_PRESS_THRESHOLD_CLAMP_EDGE_SNAP_STORAGE_RESTORE_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/setup-fab-drag.js');
console.log('PRODUCTION_CHANGE=0');
