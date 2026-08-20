const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'toggle-fav-sticker.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

const requiredMarkers = [
  'function toggleFavSticker(url, e, btn)',
  'if(e) e.stopPropagation()',
  "getLocalStickers('fav')",
  'favs.includes(url)',
  'favs = favs.filter(u => u !== url)',
  "btn.textContent = '☆'",
  'favs.unshift(url)',
  "btn.textContent = '⭐'",
  "toast('Removed from Favorites')",
  "toast('Added to Favorites ⭐')",
  "localStorage.setItem('fav_stickers', JSON.stringify(favs))"
];
for (const marker of requiredMarkers) {
  assert(source.includes(marker), `Sticker favorites marker missing: ${marker}`);
}
assert(html.includes('src/features/toggle-fav-sticker.js'), 'Sticker favorites module must remain linked from HTML');
assert(!source.includes('db.from('), 'Sticker favorites helper must not own database writes');
assert(!source.includes('sendSticker'), 'Sticker favorites helper must not own sticker sending');
assert(!source.includes('go('), 'Sticker favorites helper must not own navigation');
assert.strictEqual((source.match(/function toggleFavSticker\(/g) || []).length, 1, 'Sticker favorites helper must have one module owner');

console.log('STICKER_FAVORITES_CONTRACT_HARNESS=PASS');
console.log('EVENT_ISOLATION_ADD_REMOVE_BUTTON_TOAST_PERSISTENCE=LOCKED');
console.log('MODULE_OWNER=src/features/toggle-fav-sticker.js');
console.log('PRODUCTION_CHANGE=0');
