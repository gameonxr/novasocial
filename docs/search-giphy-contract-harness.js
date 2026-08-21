const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'search-giphy.js'), 'utf8');

for (const marker of [
  'let giphyDebounce;',
  'async function searchGiphy(q)',
  'clearTimeout(giphyDebounce)',
  "document.getElementById('giphy-results')",
  "if(!q.trim())",
  "r.innerHTML = '';",
  "Loading...",
  'giphyDebounce = setTimeout(async () => {',
  'https://api.giphy.com/v1/gifs/search?api_key=',
  "encodeURIComponent(q)",
  "&limit=12&rating=pg",
  'No GIFs found',
  'fixed_height_small.url',
  'g.images.original.url',
  'onclick="sendGif(this)"',
  'Failed to load GIFs',
  '}, 500);'
]) {
  assert(source.includes(marker), `Giphy search marker missing: ${marker}`);
}
assert.strictEqual((source.match(/fetch\(/g) || []).length, 1, 'Giphy search must own one external request');
assert.strictEqual((source.match(/setTimeout\(/g) || []).length, 1, 'Giphy search must use one debounce timer');
assert.strictEqual((source.match(/sendGif\(this\)/g) || []).length, 1, 'Giphy results must delegate one click template to sendGif');
assert.strictEqual((source.match(/limit=12/g) || []).length, 1, 'Giphy search must retain the twelve-result cap');
assert(source.includes("encodeURIComponent(q)"), 'Giphy search must encode the query');
assert(source.includes("rating=pg"), 'Giphy search must retain the PG rating constraint');
assert(!source.includes('supabase'), 'Giphy search must not own application persistence');
assert(!source.includes('sendMessage'), 'Giphy search must not own protected messaging');

console.log('SEARCH_GIPHY_CONTRACT_HARNESS=PASS');
console.log('DEBOUNCE_EMPTY_LOADING_EXTERNAL_PARAMS_CAP_URL_MAPPING_SEND_GIF_ERROR_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/search-giphy.js');
console.log('PRODUCTION_CHANGE=0');
