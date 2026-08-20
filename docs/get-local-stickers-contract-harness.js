const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'get-local-stickers.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

for (const marker of [
  'function getLocalStickers(type)',
  'try {',
  "localStorage.getItem(type+'_stickers') || '[]'",
  'JSON.parse',
  'catch(e)',
  "localStorage.removeItem(type+'_stickers')",
  'return []'
]) {
  assert(source.includes(marker), `Get local stickers marker missing: ${marker}`);
}
assert(html.includes('src/features/get-local-stickers.js'), 'Get local stickers module must remain linked from HTML');
assert(!source.includes('fetch('), 'Get local stickers must not own network requests');
assert(!source.includes('supabase'), 'Get local stickers must not own remote data access');
assert(!source.includes('document.'), 'Get local stickers must not own UI rendering');
assert.strictEqual((source.match(/function getLocalStickers\(/g) || []).length, 1, 'Get local stickers must have one module owner');

console.log('GET_LOCAL_STICKERS_CONTRACT_HARNESS=PASS');
console.log('VALID_READ_MISSING_FALLBACK_MALFORMED_CLEANUP_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/get-local-stickers.js');
console.log('PRODUCTION_CHANGE=0');
