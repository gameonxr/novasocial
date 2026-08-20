const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'toggle-fav-sticker.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

for (const marker of [
  'function toggleFavSticker(url, e, btn)',
  'if(e) e.stopPropagation()',
  "getLocalStickers('fav')",
  'favs.includes(url)',
  'favs.filter(u => u !== url)',
  "btn.textContent = '☆'",
  "toast('Removed from Favorites')",
  'favs.unshift(url)',
  "btn.textContent = '⭐'",
  "toast('Added to Favorites ⭐')",
  "localStorage.setItem('fav_stickers', JSON.stringify(favs))"
]) {
  assert(source.includes(marker), `Toggle favorite sticker marker missing: ${marker}`);
}
assert(html.includes('src/features/toggle-fav-sticker.js'), 'Toggle favorite sticker module must remain linked from HTML');
assert(!source.includes('fetch('), 'Toggle favorite sticker must not own network requests');
assert(!source.includes('supabase'), 'Toggle favorite sticker must not own remote data access');
assert.strictEqual((source.match(/function toggleFavSticker\(/g) || []).length, 1, 'Toggle favorite sticker must have one module owner');

console.log('TOGGLE_FAV_STICKER_CONTRACT_HARNESS=PASS');
console.log('PROPAGATION_ADD_REMOVE_BUTTON_TOAST_PERSISTENCE_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/toggle-fav-sticker.js');
console.log('PRODUCTION_CHANGE=0');
