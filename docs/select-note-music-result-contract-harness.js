const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'notes', 'select-note-music-result.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const featureManifestSrc = fs.readFileSync(path.join(repo, 'src', 'loaders', 'feature-manifest.js'), 'utf8'); /* architecture-migration 2026-09-29 */

for (const marker of [
  'function selectNoteMusicResult(title, artist, artwork, previewUrl)',
  'stopAllPreviewAudio()',
  'if(!previewUrl)',
  'window._noteMusic = {title, artist, artwork, previewUrl:\'\', startSec:0}',
  "document.getElementById('music-search-panel')?.remove()",
  'renderNoteMusicSection()',
  'saveRecentMusic(title, artist, artwork)',
  'showMusicSegmentPicker(title, artist, artwork, previewUrl)'
]) {
  assert(source.includes(marker), `Select note music result marker missing: ${marker}`);
}
assert(featureManifestSrc.includes('"src/features/notes/select-note-music-result.js"'), 'Select note music result module must remain linked from HTML (feature manifest — demand-loaded)'); /* architecture-migration 2026-09-29: notes demand loading */
assert(!source.includes('fetch('), 'Select note music result must not own network requests');
assert(!source.includes('supabase'), 'Select note music result must not own remote data access');
assert.strictEqual((source.match(/function selectNoteMusicResult\(/g) || []).length, 1, 'Select note music result must have one module owner');

console.log('SELECT_NOTE_MUSIC_RESULT_CONTRACT_HARNESS=PASS');
console.log('PREVIEW_CLEANUP_DIRECT_ATTACH_PANEL_RENDER_SEGMENT_DELEGATION_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/notes/select-note-music-result.js');
console.log('PRODUCTION_CHANGE=0');
