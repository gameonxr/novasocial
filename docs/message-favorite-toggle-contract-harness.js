const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'message-favorite-toggle.js'), 'utf8');

for (const marker of [
  'function toggleFavFromMsg(encUrl)',
  'const url = decodeURIComponent(encUrl)',
  "localStorage.getItem('fav_stickers') || '[]'",
  'if(favs.includes(url))',
  'favs = favs.filter(u => u !== url)',
  "toast('Removed from Favorites')",
  'favs.unshift(url)',
  "toast('Added to Favorites ⭐')",
  "localStorage.setItem('fav_stickers', JSON.stringify(favs))",
  'closeModal()'
]) {
  assert(source.includes(marker), `Message favorite toggle marker missing: ${marker}`);
}
assert(!source.includes('fetch('), 'Message favorite toggle must not own network requests');
assert.strictEqual((source.match(/function toggleFavFromMsg\(/g) || []).length, 1, 'Message favorite toggle must have one module owner');

console.log('MESSAGE_FAVORITE_TOGGLE_CONTRACT_HARNESS=PASS');
console.log('DECODE_MEMBERSHIP_TOGGLE_TOAST_STORAGE_PERSIST_MODAL_CLOSE_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/message-favorite-toggle.js');
console.log('PRODUCTION_CHANGE=0');
