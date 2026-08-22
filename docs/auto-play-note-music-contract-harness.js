const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'auto-play-note-music.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const noteOwners = fs.readFileSync(path.join(repo, 'src', 'features', 'note-viewer-owners.js'), 'utf8');

for (const marker of [
  'function autoPlayNoteMusic(url, startSec)',
  'if(_noteViewAudio){ _noteViewAudio.pause(); _noteViewAudio=null; }',
  'new Audio(url)',
  "_noteViewAudio.preload = 'auto'",
  'const doPlay = () => {',
  '_noteViewAudio.currentTime = startSec||0',
  '_noteViewAudio.play().catch(()=>{',
  'updateNoteMusicIcon(true)',
  'if(_noteViewAudio.readyState >= 1)',
  "_noteViewAudio.addEventListener('loadedmetadata', doPlay, {once:true})",
  'currentTime >= _noteViewAudio.duration - 0.15',
  '_noteViewAudio.currentTime = startSec||0'
]) {
  assert(source.includes(marker), `Auto-play note music marker missing: ${marker}`);
}
assert(`${html}\n${noteOwners}`.includes('autoPlayNoteMusic(note.music_preview_url, note.music_start_sec||0)'), 'Note viewer must retain the autoplay controller call');
assert(!source.includes('fetch('), 'Auto-play note music must not own network requests');
assert(!source.includes('localStorage'), 'Auto-play note music must not own persistence');
assert.strictEqual((source.match(/function autoPlayNoteMusic\(/g) || []).length, 1, 'Auto-play note music must have one module owner');

console.log('AUTO_PLAY_NOTE_MUSIC_CONTRACT_HARNESS=PASS');
console.log('AUDIO_CLEANUP_PRELOAD_METADATA_START_OFFSET_ICON_LOOP_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/auto-play-note-music.js');
console.log('PRODUCTION_CHANGE=0');
