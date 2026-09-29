const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'dms', 'save-local-sticker.js') /* architecture-migration 2026-09-29: dms folder */, 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const featureManifestSrc = fs.readFileSync(path.join(repo, 'src', 'loaders', 'feature-manifest.js'), 'utf8'); /* architecture-migration 2026-09-29 */

for (const marker of [
  'function saveLocalSticker(type, url)',
  'let arr = getLocalStickers(type)',
  'if(!arr.includes(url))',
  'arr.unshift(url)',
  'if(arr.length > 20) arr.pop()',
  "localStorage.setItem(type+'_stickers', JSON.stringify(arr))"
]) {
  assert(source.includes(marker), `Save local sticker marker missing: ${marker}`);
}
assert(featureManifestSrc.includes('"src/features/dms/save-local-sticker.js"'), 'Save local sticker module must remain linked from HTML (feature manifest — demand-loaded)'); /* architecture-migration 2026-09-29: demand loading */
assert(source.includes('getLocalStickers(type)'), 'Save local sticker must delegate list loading');
assert(!source.includes('fetch('), 'Save local sticker must not own network requests');
assert(!source.includes('supabase'), 'Save local sticker must not own remote data access');
assert(!source.includes('document.'), 'Save local sticker must not own UI rendering');
assert.strictEqual((source.match(/function saveLocalSticker\(/g) || []).length, 1, 'Save local sticker must have one module owner');

console.log('SAVE_LOCAL_STICKER_CONTRACT_HARNESS=PASS');
console.log('DEDUP_NEWEST_FIRST_TWENTY_CAP_DYNAMIC_KEY_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/dms/save-local-sticker.js');
console.log('PRODUCTION_CHANGE=0');
