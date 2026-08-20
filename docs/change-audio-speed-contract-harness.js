const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'change-audio-speed.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

for (const marker of [
  'function changeAudioSpeed(btn)',
  'const audio = btn.previousElementSibling',
  'if(!audio) return',
  'audio.playbackRate === 1',
  "audio.playbackRate = 1.5",
  "btn.textContent = '1.5x'",
  'audio.playbackRate === 1.5',
  'audio.playbackRate = 2',
  "btn.textContent = '2x'",
  "audio.playbackRate = 1",
  "btn.textContent = '1x'",
  "toast('Speed: ' + btn.textContent)"
]) {
  assert(source.includes(marker), `Change audio speed marker missing: ${marker}`);
}
assert(html.includes('src/features/change-audio-speed.js'), 'Change audio speed module must remain linked from HTML');
assert(!source.includes('fetch('), 'Change audio speed must not own network requests');
assert(!source.includes('supabase'), 'Change audio speed must not own remote data access');
assert.strictEqual((source.match(/function changeAudioSpeed\(/g) || []).length, 1, 'Change audio speed must have one module owner');

console.log('CHANGE_AUDIO_SPEED_CONTRACT_HARNESS=PASS');
console.log('GUARD_ONE_ONEHALF_TWO_CYCLE_LABEL_TOAST_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/change-audio-speed.js');
console.log('PRODUCTION_CHANGE=0');
