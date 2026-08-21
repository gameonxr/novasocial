const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'search-music-for-note.js'), 'utf8');
const recent = fs.readFileSync(path.join(repo, 'src', 'features', 'render-recent-music-suggestions.js'), 'utf8');
const preview = fs.readFileSync(path.join(repo, 'src', 'features', 'toggle-preview-play.js'), 'utf8');
const selection = fs.readFileSync(path.join(repo, 'src', 'features', 'select-note-music-result.js'), 'utf8');

for (const marker of [
  'async function searchMusicForNote(q)',
  'clearTimeout(_musicSearchDebounce)',
  "document.getElementById('music-search-results')",
  'if(!r) return;',
  "if(!q.trim()){ renderRecentMusicSuggestions(); return; }",
  'Searching...',
  '_musicSearchDebounce = setTimeout(async()=>',
  'https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&entity=song&limit=15',
  'const data = await res.json()',
  'No songs found',
  'togglePreviewPlay(',
  'selectNoteMusicResult(',
  'Search failed, try again',
  '}, 400);'
]) {
  assert(source.includes(marker), `Search music for note marker missing: ${marker}`);
}
assert(recent.includes('function renderRecentMusicSuggestions()'), 'Empty music query must retain recent-suggestions delegation');
assert(preview.includes('function togglePreviewPlay(idx, url)'), 'Search results must retain preview handler delegation');
assert(selection.includes('function selectNoteMusicResult('), 'Search results must retain selection handler delegation');
assert(!source.includes('saveRecentMusic'), 'Search music for note must not own recent persistence');
assert.strictEqual((source.match(/async function searchMusicForNote\(/g) || []).length, 1, 'Search music for note must have one module owner');

console.log('SEARCH_MUSIC_FOR_NOTE_CONTRACT_HARNESS=PASS');
console.log('DEBOUNCE_QUERY_BRANCH_REQUEST_RESULT_ERROR_HANDLER_DELEGATION_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/search-music-for-note.js');
console.log('PRODUCTION_CHANGE=0');
