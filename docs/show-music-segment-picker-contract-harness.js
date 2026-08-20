const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'show-music-segment-picker.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

for (const marker of [
  'function showMusicSegmentPicker(title, artist, artwork, previewUrl)',
  'stopAllPreviewAudio()',
  "document.getElementById('music-search-panel')?.remove()",
  "panel.id = 'music-segment-panel'",
  'Choose Part',
  'cancelSegmentPicker()',
  'confirmMusicSegment(',
  "artwork.replace('60x60','300x300')",
  'toggleSegmentPreview(',
  "id=\"segment-play-btn\"",
  "id=\"waveform-track\"",
  'Array.from({length:50})',
  "id=\"drag-window\"",
  "id=\"segment-time-label\"",
  '0:00 - 0:08',
  'document.body.appendChild(panel)',
  'window._segmentStartSec = 0',
  'setupSegmentDragWindow(previewUrl)'
]) {
  assert(source.includes(marker), `Show music segment picker marker missing: ${marker}`);
}
assert(html.includes('src/features/show-music-segment-picker.js'), 'Show music segment picker module must remain linked from HTML');
assert(!source.includes('fetch('), 'Show music segment picker must not own network requests');
assert(!source.includes('supabase'), 'Show music segment picker must not own remote data access');
assert.strictEqual((source.match(/function showMusicSegmentPicker\(/g) || []).length, 1, 'Show music segment picker must have one module owner');

console.log('SHOW_MUSIC_SEGMENT_PICKER_CONTRACT_HARNESS=PASS');
console.log('CLEANUP_METADATA_PREVIEW_WAVEFORM_DRAG_INIT_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/show-music-segment-picker.js');
console.log('PRODUCTION_CHANGE=0');
