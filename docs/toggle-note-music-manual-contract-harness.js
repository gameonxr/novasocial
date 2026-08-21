const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'toggle-note-music-manual.js'), 'utf8');
const autoplay = fs.readFileSync(path.join(repo, 'src', 'features', 'auto-play-note-music.js'), 'utf8');

for (const marker of [
  'function toggleNoteMusicManual(url, startSec)',
  'if(_noteViewAudio && !_noteViewAudio.paused)',
  '_noteViewAudio.pause()',
  'updateNoteMusicIcon(false)',
  'return;',
  'autoPlayNoteMusic(url, startSec)'
]) {
  assert(source.includes(marker), `Toggle note music manual marker missing: ${marker}`);
}
assert(autoplay.includes('function autoPlayNoteMusic(url, startSec)'), 'Manual toggle must retain autoplay delegation target');
assert(!source.includes('new Audio'), 'Toggle note music manual must not create audio objects');
assert(!source.includes('fetch('), 'Toggle note music manual must not own network requests');
assert.strictEqual((source.match(/function toggleNoteMusicManual\(/g) || []).length, 1, 'Toggle note music manual must have one module owner');

console.log('TOGGLE_NOTE_MUSIC_MANUAL_CONTRACT_HARNESS=PASS');
console.log('ACTIVE_PAUSE_ICON_RESET_EARLY_RETURN_AUTOPLAY_DELEGATION_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/toggle-note-music-manual.js');
console.log('PRODUCTION_CHANGE=0');
