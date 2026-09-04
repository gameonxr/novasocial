const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'play-next-audio.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

for (const marker of [
  'function playNextAudio(audioEl)',
  "document.querySelectorAll('audio')",
  'for(let i=0; i<allAudios.length; i++)',
  'if(allAudios[i] === audioEl && i+1 < allAudios.length)',
  'allAudios[i+1].play()',
  'break;'
]) {
  assert(source.includes(marker), `Play next audio marker missing: ${marker}`);
}
assert((html + '\n' + fs.readFileSync(path.join(repo, 'src', 'features', 'load-msgs.js'), 'utf8')).includes('onended="playNextAudio(this)"'), 'Audio markup must retain the play-next-audio ended handler');
assert(!source.includes('fetch('), 'Play next audio must not own network requests');
assert(!source.includes('localStorage'), 'Play next audio must not own persistence');
assert.strictEqual((source.match(/function playNextAudio\(/g) || []).length, 1, 'Play next audio must have one module owner');

console.log('PLAY_NEXT_AUDIO_CONTRACT_HARNESS=PASS');
console.log('ORDERED_LOOKUP_IDENTITY_MATCH_NEXT_GUARD_PLAYBACK_LOOP_EXIT_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/play-next-audio.js');
console.log('PRODUCTION_CHANGE=0');
