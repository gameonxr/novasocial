const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'toggle-reels-mute.js'), 'utf8');

for (const marker of [
  'function toggleReelsMute()',
  'reelsMuted=!reelsMuted',
  "document.getElementById('rv-' + currentReelIdx)",
  'if(v)',
  'v.muted = reelsMuted',
  'if(!reelsMuted) v.play().catch(()=>{})',
  "document.querySelectorAll('.mute-icon')",
  "ico('mute','#fff',20)",
  "ico('unmute','#fff',20)",
  "toast(reelsMuted?'🔇 Muted':'🔊 Sound On')"
]) {
  assert(source.includes(marker), `Toggle Reels mute marker missing: ${marker}`);
}
assert(!source.includes('renderReels'), 'Toggle Reels mute must not own the protected Reels renderer');
assert(!source.includes('fetch('), 'Toggle Reels mute must not own network requests');
assert.strictEqual((source.match(/function toggleReelsMute\(/g) || []).length, 1, 'Toggle Reels mute must have one module owner');

console.log('TOGGLE_REELS_MUTE_CONTRACT_HARNESS=PASS');
console.log('STATE_INVERSION_CURRENT_VIDEO_GUARD_PLAYBACK_ICON_TOAST_PROTECTED_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/toggle-reels-mute.js');
console.log('PRODUCTION_CHANGE=0');
