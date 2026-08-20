const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'sticker-tab.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

for (const marker of [
  'function showStickerTab(tab)',
  'activeStickerTab = tab',
  "['recent','fav','search']",
  "document.getElementById('tab-'+t)",
  "document.getElementById('tab-'+tab)",
  "document.getElementById('sticker-content')",
  "JSON.parse(localStorage.getItem('fav_stickers') || '[]')",
  "JSON.parse(localStorage.getItem('recent_stickers') || '[]')",
  'window._stickerUrls = []',
  "tab === 'recent'",
  "tab === 'fav'",
  "tab === 'search'",
  'stickerSend(',
  'stickerToggleFav(',
  'Search GIFs...',
  'searchGiphy(\'trending\')'
]) {
  assert(source.includes(marker), `Sticker tab marker missing: ${marker}`);
}
assert(html.includes('src/features/sticker-tab.js'), 'Sticker tab module must remain linked from HTML');
assert(source.includes('Abhi koi recent sticker nahi hai.'), 'Recent empty state must remain present');
assert(source.includes('Koi favorite nahi.'), 'Favorite empty state must remain present');
assert(!source.includes('fetch('), 'Sticker tab must not own network requests');
assert(!source.includes('supabase'), 'Sticker tab must not own remote data access');
assert.strictEqual((source.match(/function showStickerTab\(/g) || []).length, 1, 'Sticker tab must have one module owner');

console.log('STICKER_TAB_CONTRACT_HARNESS=PASS');
console.log('ACTIVATION_LOCAL_READS_EMPTY_STATES_GRID_SEARCH_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/sticker-tab.js');
console.log('PRODUCTION_CHANGE=0');
