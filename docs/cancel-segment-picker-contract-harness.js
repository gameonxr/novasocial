const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'cancel-segment-picker.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

for (const marker of [
  'function cancelSegmentPicker()',
  'if(_segmentAudio)',
  '_segmentAudio.pause()',
  '_segmentAudio=null',
  "document.getElementById('music-segment-panel')?.remove()"
]) {
  assert(source.includes(marker), `Cancel segment picker marker missing: ${marker}`);
}
assert(html.includes('src/features/cancel-segment-picker.js'), 'Cancel segment picker module must remain linked from HTML');
assert(!source.includes('fetch('), 'Cancel segment picker must not own network requests');
assert(!source.includes('supabase'), 'Cancel segment picker must not own remote data access');
assert(!source.includes('confirmMusicSegment'), 'Cancel segment picker must not own segment confirmation');
assert.strictEqual((source.match(/function cancelSegmentPicker\(/g) || []).length, 1, 'Cancel segment picker must have one module owner');

console.log('CANCEL_SEGMENT_PICKER_CONTRACT_HARNESS=PASS');
console.log('AUDIO_PAUSE_STATE_RESET_PANEL_REMOVAL_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/cancel-segment-picker.js');
console.log('PRODUCTION_CHANGE=0');
