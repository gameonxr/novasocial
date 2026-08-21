const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'setup-home-hold-restore.js'), 'utf8');

for (const marker of [
  'function setupHomeHoldRestore()',
  "document.addEventListener('touchstart'",
  "e.target.closest('.nb[data-t=\"home\"]')",
  'homeTimer = setTimeout(() => {',
  'restoreFabButton()',
  'haptic(20)',
  '}, 2000)',
  "document.addEventListener('touchend'",
  "document.addEventListener('touchmove'",
  "document.addEventListener('mousedown'",
  "document.addEventListener('mouseup'",
  'clearTimeout(homeTimer)',
  'homeTimer = null'
]) {
  assert(source.includes(marker), `Home hold restore marker missing: ${marker}`);
}
assert.strictEqual((source.match(/setTimeout\(/g) || []).length, 2, 'Home hold restore must have touch and mouse timers');
assert.strictEqual((source.match(/restoreFabButton\(\)/g) || []).length, 2, 'Home hold restore must delegate once per input modality');
assert.strictEqual((source.match(/clearTimeout\(homeTimer\)/g) || []).length, 3, 'Home hold restore must cancel touchend, touchmove, and mouseup');
assert(!source.includes('fetch('), 'Home hold restore must not own network requests');
assert(!source.includes('supabase'), 'Home hold restore must not own persistence');

console.log('SETUP_HOME_HOLD_RESTORE_CONTRACT_HARNESS=PASS');
console.log('HOME_FILTER_TWO_SECOND_TOUCH_MOUSE_RESTORE_HAPTIC_CANCELLATION_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/setup-home-hold-restore.js');
console.log('PRODUCTION_CHANGE=0');
