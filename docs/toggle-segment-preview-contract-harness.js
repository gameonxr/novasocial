const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'toggle-segment-preview.js'), 'utf8');
const picker = fs.readFileSync(path.join(repo, 'src', 'features', 'show-music-segment-picker.js'), 'utf8');

for (const marker of [
  'function toggleSegmentPreview(url)',
  "document.getElementById('segment-play-icon')",
  'if(_segmentAudio && !_segmentAudio.paused)',
  '_segmentAudio.pause()',
  "icon.innerHTML = '<polygon points=\"5 3 19 12 5 21 5 3\"/>'",
  'if(!_segmentAudio) _segmentAudio = new Audio(url)',
  '_segmentAudio.currentTime = window._segmentStartSec || 0',
  "_segmentAudio.play().catch(()=>toast('Play failed'))",
  "icon.innerHTML = '<rect x=\"6\" y=\"4\" width=\"4\" height=\"16\"/><rect x=\"14\" y=\"4\" width=\"4\" height=\"16\"/>'",
  "_segmentAudio.onended = ()=>{ icon.innerHTML = '<polygon points=\"5 3 19 12 5 21 5 3\"/>'; }"
]) {
  assert(source.includes(marker), `Toggle segment preview marker missing: ${marker}`);
}
assert(picker.includes('toggleSegmentPreview('), 'Segment picker must retain the segment preview handler');
assert(!source.includes('fetch('), 'Toggle segment preview must not own network requests');
assert(!source.includes('saveRecentMusic'), 'Toggle segment preview must not own recents persistence');
assert.strictEqual((source.match(/function toggleSegmentPreview\(/g) || []).length, 1, 'Toggle segment preview must have one module owner');

console.log('TOGGLE_SEGMENT_PREVIEW_CONTRACT_HARNESS=PASS');
console.log('PAUSE_PLAY_REUSE_OFFSET_ERROR_ICON_ENDED_CLEANUP_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/toggle-segment-preview.js');
console.log('PRODUCTION_CHANGE=0');
