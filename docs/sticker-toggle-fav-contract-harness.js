const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'sticker-toggle-fav.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

for (const marker of [
  'function stickerToggleFav(idx)',
  'window._stickerUrls || []',
  'if(!url) return',
  "JSON.parse(localStorage.getItem('fav_stickers') || '[]')",
  'const wasFav = favs.includes(url)',
  'favs.filter(u => u !== url)',
  "toast('Removed from Favorites')",
  'favs.unshift(url)',
  "toast('Added to Favorites ⭐')",
  "localStorage.setItem('fav_stickers', JSON.stringify(favs))",
  "if(activeStickerTab === 'fav')",
  "showStickerTab('fav')",
  "document.getElementById('fav-btn-'+idx)",
  "btn.textContent = wasFav ? '☆' : '⭐'"
]) {
  assert(source.includes(marker), `Sticker toggle favorite marker missing: ${marker}`);
}
assert(html.includes('src/features/sticker-toggle-fav.js'), 'Sticker toggle favorite module must remain linked from HTML');
assert(!source.includes('fetch('), 'Sticker toggle favorite must not own network requests');
assert(!source.includes('supabase'), 'Sticker toggle favorite must not own remote data access');
assert.strictEqual((source.match(/function stickerToggleFav\(/g) || []).length, 1, 'Sticker toggle favorite must have one module owner');

console.log('STICKER_TOGGLE_FAV_CONTRACT_HARNESS=PASS');
console.log('INDEX_GUARD_ADD_REMOVE_REFRESH_BUTTON_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/sticker-toggle-fav.js');
console.log('PRODUCTION_CHANGE=0');
