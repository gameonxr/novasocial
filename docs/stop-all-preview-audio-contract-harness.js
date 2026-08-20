const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'stop-all-preview-audio.js'), 'utf8');

for (const marker of [
  'function stopAllPreviewAudio()',
  'if(_previewAudio)',
  '_previewAudio.pause()',
  '_previewAudio=null',
  '_previewPlayingIdx = null'
]) {
  assert(source.includes(marker), `Stop preview audio marker missing: ${marker}`);
}
assert(!source.includes('new Audio'), 'Stop preview audio must not create audio objects');
assert(!source.includes('fetch('), 'Stop preview audio must not own network requests');
assert(!source.includes('play()'), 'Stop preview audio must not start playback');
assert.strictEqual((source.match(/function stopAllPreviewAudio\(/g) || []).length, 1, 'Stop preview audio must have one module owner');

console.log('STOP_ALL_PREVIEW_AUDIO_CONTRACT_HARNESS=PASS');
console.log('GUARDED_PAUSE_REFERENCE_CLEAR_INDEX_RESET_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/stop-all-preview-audio.js');
console.log('PRODUCTION_CHANGE=0');
