const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'confirm-music-segment.js'), 'utf8');
const picker = fs.readFileSync(path.join(repo, 'src', 'features', 'show-music-segment-picker.js'), 'utf8');

for (const marker of [
  'function confirmMusicSegment(title, artist, artwork, previewUrl)',
  'if(_segmentAudio)',
  '_segmentAudio.pause()',
  '_segmentAudio=null',
  'window._noteMusic = {title, artist, artwork, previewUrl, startSec: window._segmentStartSec||0}',
  "document.getElementById('music-segment-panel')?.remove()",
  'renderNoteMusicSection()',
  'saveRecentMusic(title, artist, artwork, previewUrl)'
]) {
  assert(source.includes(marker), `Confirm music segment marker missing: ${marker}`);
}
assert(picker.includes('confirmMusicSegment('), 'Segment picker must retain the confirmation handler');
assert(!source.includes('fetch('), 'Confirm music segment must not own network requests');
assert(!source.includes('new Audio'), 'Confirm music segment must not create audio objects');
assert.strictEqual((source.match(/function confirmMusicSegment\(/g) || []).length, 1, 'Confirm music segment must have one module owner');

console.log('CONFIRM_MUSIC_SEGMENT_CONTRACT_HARNESS=PASS');
console.log('SEGMENT_AUDIO_CLEANUP_STATE_ASSIGNMENT_PANEL_RENDER_RECENTS_DELEGATION_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/confirm-music-segment.js');
console.log('PRODUCTION_CHANGE=0');
