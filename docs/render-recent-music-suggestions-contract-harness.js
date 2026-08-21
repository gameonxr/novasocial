const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'render-recent-music-suggestions.js'), 'utf8');
const selector = fs.readFileSync(path.join(repo, 'src', 'features', 'select-note-music-result.js'), 'utf8');

for (const marker of [
  'function renderRecentMusicSuggestions()',
  "document.getElementById('music-search-results')",
  'if(!r) return;',
  "localStorage.getItem('nova_recent_music')",
  "JSON.parse(localStorage.getItem('nova_recent_music')||'[]')",
  'if(!recents.length)',
  'Gaana search karo shuru karne ke liye',
  'RECENTLY USED',
  'recents.map(song=>',
  'selectNoteMusicResult(',
  'song.artwork||""',
  'song.previewUrl||""'
]) {
  assert(source.includes(marker), `Render recent music suggestions marker missing: ${marker}`);
}
assert(selector.includes('function selectNoteMusicResult('), 'Recent suggestions must retain the music selection handler');
assert(!source.includes('setItem('), 'Render recent music suggestions must not write recent persistence');
assert(!source.includes('fetch('), 'Render recent music suggestions must not own network requests');
assert.strictEqual((source.match(/function renderRecentMusicSuggestions\(/g) || []).length, 1, 'Render recent music suggestions must have one module owner');

console.log('RENDER_RECENT_MUSIC_SUGGESTIONS_CONTRACT_HARNESS=PASS');
console.log('GUARDED_STORAGE_PARSE_EMPTY_STATE_RECENT_MAPPING_SELECTION_DELEGATION_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/render-recent-music-suggestions.js');
console.log('PRODUCTION_CHANGE=0');
