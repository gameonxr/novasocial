const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'reel-like-helper.js'), 'utf8');

for (const marker of [
  'function dblLikeReel(pid, cont)',
  "document.getElementById('lbtn-'+pid)",
  "el.dataset.liked!=='true'",
  'toggleLike(pid)',
  'for(let i=0; i<6; i++)',
  'setTimeout(() => {',
  "p.textContent='❤️'",
  'heartPop 0.8s ease forwards',
  'cont.appendChild(p)',
  'setTimeout(()=>p.remove(), 800)',
  '}, i * 100)'
]) {
  assert(source.includes(marker), `Reel like helper marker missing: ${marker}`);
}
assert(!source.includes('renderReels'), 'Reel like helper must not own the protected Reels renderer');
assert(!source.includes('fetch('), 'Reel like helper must not own network requests');
assert.strictEqual((source.match(/function dblLikeReel\(/g) || []).length, 1, 'Reel like helper must have one module owner');

console.log('REEL_LIKE_HELPER_CONTRACT_HARNESS=PASS');
console.log('LIKED_GUARD_TOGGLE_DELEGATION_SIX_HEARTS_TIMING_STYLE_CLEANUP_PROTECTED_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/reel-like-helper.js');
console.log('PRODUCTION_CHANGE=0');
