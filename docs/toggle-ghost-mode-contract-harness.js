const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'toggle-ghost-mode.js'), 'utf8');

for (const marker of [
  'async function toggleGhostMode()',
  'const newMode = !(PROF?.ghost_mode || false)',
  "db.from('profiles').update({ ghost_mode: newMode }).eq('id', ME.id)",
  'PROF.ghost_mode = newMode',
  "document.getElementById('ghost-status').innerText",
  "newMode ? 'ON 🟢' : 'OFF 🔴'",
  "toast(newMode ? 'Ghost Mode Activated 👻' : 'Ghost Mode Deactivated')"
]) {
  assert(source.includes(marker), `Ghost Mode marker missing: ${marker}`);
}
assert.strictEqual((source.match(/db\.from\('profiles'\)/g) || []).length, 1, 'Ghost Mode must own one profile update');
assert.strictEqual((source.match(/ghost_mode/g) || []).length, 3, 'Ghost Mode must retain read, remote update, and local synchronization');
assert.strictEqual((source.match(/toast\(/g) || []).length, 1, 'Ghost Mode must retain one conditional toast');
assert(!source.includes('delete('), 'Ghost Mode must not own destructive persistence');
assert(!source.includes('sendMessage'), 'Ghost Mode must not own protected messaging');
assert(!source.includes('renderReels'), 'Ghost Mode must not own the protected Reels renderer');

console.log('TOGGLE_GHOST_MODE_CONTRACT_HARNESS=PASS');
console.log('INVERSION_PROFILE_UPDATE_LOCAL_SYNC_STATUS_TEXT_CONDITIONAL_TOAST_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/toggle-ghost-mode.js');
console.log('PRODUCTION_CHANGE=0');
