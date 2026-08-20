const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'update-note-music-icon.js'), 'utf8');

for (const marker of [
  'function updateNoteMusicIcon(playing)',
  "document.getElementById('note-music-play-icon')",
  'if(!icon) return;',
  "'<rect x=\"6\" y=\"4\" width=\"4\" height=\"16\"/><rect x=\"14\" y=\"4\" width=\"4\" height=\"16\"/>'",
  "'<polygon points=\"5 3 19 12 5 21 5 3\"/>'"
]) {
  assert(source.includes(marker), `Update note music icon marker missing: ${marker}`);
}
assert(!source.includes('new Audio'), 'Update note music icon must not create audio objects');
assert(!source.includes('fetch('), 'Update note music icon must not own network requests');
assert.strictEqual((source.match(/function updateNoteMusicIcon\(/g) || []).length, 1, 'Update note music icon must have one module owner');

console.log('UPDATE_NOTE_MUSIC_ICON_CONTRACT_HARNESS=PASS');
console.log('DOM_GUARD_PLAY_PAUSE_SVG_BRANCHES_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/update-note-music-icon.js');
console.log('PRODUCTION_CHANGE=0');
