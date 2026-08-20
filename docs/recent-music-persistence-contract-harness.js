const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'save-recent-music.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

const requiredMarkers = [
  'function saveRecentMusic(title, artist, artwork, previewUrl)',
  "localStorage.getItem('nova_recent_music'",
  'JSON.parse',
  'recents.filter(s=>s.title!==title || s.artist!==artist)',
  'recents.unshift({title, artist, artwork, previewUrl})',
  'if(recents.length>8) recents = recents.slice(0,8)',
  "localStorage.setItem('nova_recent_music', JSON.stringify(recents))",
  '}catch(e){}'
];
for (const marker of requiredMarkers) {
  assert(source.includes(marker), `Recent music marker missing: ${marker}`);
}
assert(html.includes('src/features/save-recent-music.js'), 'Recent music module must remain linked from HTML');
assert(!source.includes('db.from('), 'Recent music helper must not own database writes');
assert(!source.includes('play'), 'Recent music helper must not own playback');
assert(!source.includes('search'), 'Recent music helper must not own search');
assert.strictEqual((source.match(/function saveRecentMusic\(/g) || []).length, 1, 'Recent music helper must have one module owner');

console.log('RECENT_MUSIC_PERSISTENCE_CONTRACT_HARNESS=PASS');
console.log('KEY_DEDUP_ORDER_METADATA_CAP_FAILURE_TOLERANCE=LOCKED');
console.log('MODULE_OWNER=src/features/save-recent-music.js');
console.log('PRODUCTION_CHANGE=0');
