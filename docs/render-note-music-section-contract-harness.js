const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'render-note-music-section.js'), 'utf8');
const search = fs.readFileSync(path.join(repo, 'src', 'features', 'open-music-search.js'), 'utf8');

for (const marker of [
  'function renderNoteMusicSection()',
  "document.getElementById('note-music-section')",
  'if(!sec) return;',
  'if(window._noteMusic)',
  'window._noteMusic.artwork',
  'window._noteMusic.title',
  'window._noteMusic.artist||\'\'',
  'window._noteMusic=null;renderNoteMusicSection()',
  "onclick=\"openMusicSearch()\"",
  'Add a song'
]) {
  assert(source.includes(marker), `Render note music section marker missing: ${marker}`);
}
assert(search.includes('function openMusicSearch()'), 'Open music search module must remain available to the empty state');
assert(!source.includes('fetch('), 'Render note music section must not own network requests');
assert(!source.includes('saveRecentMusic'), 'Render note music section must not own recent persistence');
assert(!source.includes('new Audio'), 'Render note music section must not own audio playback');
assert.strictEqual((source.match(/function renderNoteMusicSection\(/g) || []).length, 1, 'Render note music section must have one module owner');

console.log('RENDER_NOTE_MUSIC_SECTION_CONTRACT_HARNESS=PASS');
console.log('GUARDED_LOOKUP_SELECTED_EMPTY_CLEAR_SEARCH_DELEGATION_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/render-note-music-section.js');
console.log('PRODUCTION_CHANGE=0');
