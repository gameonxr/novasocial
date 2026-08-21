const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'save-recent-music.js'), 'utf8');
const renderer = fs.readFileSync(path.join(repo, 'src', 'features', 'render-recent-music-suggestions.js'), 'utf8');

for (const marker of [
  'function saveRecentMusic(title, artist, artwork, previewUrl)',
  'try{',
  "localStorage.getItem('nova_recent_music')||'[]'",
  'recents = recents.filter(s=>s.title!==title || s.artist!==artist)',
  'recents.unshift({title, artist, artwork, previewUrl})',
  'if(recents.length>8) recents = recents.slice(0,8)',
  "localStorage.setItem('nova_recent_music', JSON.stringify(recents))",
  '}catch(e){}'
]) {
  assert(source.includes(marker), `Save recent music marker missing: ${marker}`);
}
assert(renderer.includes("localStorage.getItem('nova_recent_music')"), 'Recent suggestions must read the same recent-music storage key');
assert(!source.includes('fetch('), 'Save recent music must not own network requests');
assert(!source.includes('innerHTML'), 'Save recent music must not own rendering');
assert.strictEqual((source.match(/function saveRecentMusic\(/g) || []).length, 1, 'Save recent music must have one module owner');

console.log('SAVE_RECENT_MUSIC_CONTRACT_HARNESS=PASS');
console.log('STORAGE_FALLBACK_DEDUP_NEWEST_FIRST_CAP_PERSIST_GUARDED_FAILURE_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/save-recent-music.js');
console.log('PRODUCTION_CHANGE=0');
