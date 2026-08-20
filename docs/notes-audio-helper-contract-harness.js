const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const autoplay = fs.readFileSync(path.join(repo, 'src', 'features', 'auto-play-note-music.js'), 'utf8');
const manual = fs.readFileSync(path.join(repo, 'src', 'features', 'toggle-note-music-manual.js'), 'utf8');
const next = fs.readFileSync(path.join(repo, 'src', 'features', 'play-next-audio.js'), 'utf8');
const cleanup = fs.readFileSync(path.join(repo, 'src', 'features', 'stop-all-preview-audio.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

const autoplayMarkers = [
  'function autoPlayNoteMusic(url, startSec)',
  'if(_noteViewAudio){ _noteViewAudio.pause(); _noteViewAudio=null; }',
  '_noteViewAudio = new Audio(url)',
  '_noteViewAudio.preload = \'auto\'',
  '_noteViewAudio.currentTime = startSec||0',
  '_noteViewAudio.play().catch',
  'readyState >= 1',
  "addEventListener('loadedmetadata', doPlay, {once:true})",
  "addEventListener('timeupdate', function()",
  '_noteViewAudio.duration - 0.15',
  'updateNoteMusicIcon(true)'
];
for (const marker of autoplayMarkers) {
  assert(autoplay.includes(marker), `Notes autoplay marker missing: ${marker}`);
}
assert(manual.includes('function toggleNoteMusicManual(url, startSec)'), 'Manual Notes-audio toggle must remain present');
assert(manual.includes('_noteViewAudio.pause()'), 'Manual toggle must pause active audio');
assert(manual.includes('updateNoteMusicIcon(false)'), 'Manual pause must update the music icon');
assert(manual.includes('autoPlayNoteMusic(url, startSec)'), 'Manual play must delegate to autoplay');
assert(next.includes('function playNextAudio(audioEl)'), 'Next-audio helper must remain present');
assert(next.includes("document.querySelectorAll('audio')"), 'Next-audio helper must inspect document audio order');
assert(next.includes('i+1 < allAudios.length'), 'Next-audio helper must guard the final element');
assert(next.includes('allAudios[i+1].play()'), 'Next-audio helper must play the immediate next element');
assert(cleanup.includes('function stopAllPreviewAudio()'), 'Preview cleanup helper must remain present');
assert(cleanup.includes('_previewAudio.pause()'), 'Preview cleanup must pause active preview audio');
assert(cleanup.includes('_previewPlayingIdx = null'), 'Preview cleanup must reset preview index');
for (const file of ['auto-play-note-music.js', 'toggle-note-music-manual.js', 'play-next-audio.js', 'stop-all-preview-audio.js']) {
  assert(html.includes(`src/features/${file}`), `${file} must remain linked from HTML`);
}
assert.strictEqual((autoplay.match(/function autoPlayNoteMusic\(/g) || []).length, 1, 'Autoplay helper must have one module owner');

console.log('NOTES_AUDIO_HELPER_CONTRACT_HARNESS=PASS');
console.log('REPLACE_METADATA_LOOP_MANUAL_NEXT_CLEANUP=LOCKED');
console.log('PRODUCTION_CHANGE=0');
