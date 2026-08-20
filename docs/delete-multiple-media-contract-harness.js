const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'delete-multiple-media.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

for (const marker of [
  'async function deleteMultipleMediaProduction(mediaUrls, source, reason)',
  'const urls = (mediaUrls || []).filter(Boolean)',
  'if(!urls.length) return []',
  'const results = await Promise.allSettled(',
  'urls.map(url => deleteMediaProduction(url, source, reason))',
  'return results'
]) {
  assert(source.includes(marker), `Delete multiple media marker missing: ${marker}`);
}
assert(html.includes('src/features/delete-multiple-media.js'), 'Delete multiple media module must remain linked from HTML');
assert(source.includes('deleteMediaProduction'), 'Delete multiple media must preserve the protected deletion delegate');
assert(!source.includes('fetch('), 'Delete multiple media must not add network behavior');
assert(!source.includes('supabase'), 'Delete multiple media must not add remote data behavior');
assert.strictEqual((source.match(/function deleteMultipleMediaProduction\(/g) || []).length, 1, 'Delete multiple media must have one module owner');

console.log('DELETE_MULTIPLE_MEDIA_CONTRACT_HARNESS=PASS');
console.log('NORMALIZE_EMPTY_GUARD_ALL_SETTLED_PROTECTED_DELEGATE_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/delete-multiple-media.js');
console.log('PRODUCTION_CHANGE=0');
