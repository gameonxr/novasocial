const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'open-music-search.js'), 'utf8');
const section = fs.readFileSync(path.join(repo, 'src', 'features', 'render-note-music-section.js'), 'utf8');

for (const marker of [
  'function openMusicSearch()',
  "panel.className = 'se-panel'",
  "panel.id = 'music-search-panel'",
  "id=\"music-search-inp\"",
  'oninput="searchMusicForNote(this.value)"',
  'id="music-search-results"',
  'document.body.appendChild(panel)',
  'setTimeout(()=>',
  'inp?.focus()',
  "inp.scrollIntoView({block:'center', behavior:'smooth'})",
  'renderRecentMusicSuggestions()'
]) {
  assert(source.includes(marker), `Open music search marker missing: ${marker}`);
}
assert(source.includes("stopAllPreviewAudio();document.getElementById('music-search-panel').remove()"), 'Music search close handler must stop preview audio and remove the panel');
assert(section.includes('openMusicSearch()'), 'Note music section must retain the open-search handler');
assert(!source.includes('fetch('), 'Open music search must not own search requests');
assert(!source.includes('saveRecentMusic'), 'Open music search must not own recent persistence');
assert.strictEqual((source.match(/function openMusicSearch\(/g) || []).length, 1, 'Open music search must have one module owner');

console.log('OPEN_MUSIC_SEARCH_CONTRACT_HARNESS=PASS');
console.log('PANEL_IDS_HANDLERS_DOM_INSERTION_FOCUS_RECENTS_DELEGATION_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/open-music-search.js');
console.log('PRODUCTION_CHANGE=0');
