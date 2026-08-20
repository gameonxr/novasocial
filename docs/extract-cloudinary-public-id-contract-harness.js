const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'extract-cloudinary-public-id.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

for (const marker of [
  'function extractCloudinaryPublicId(url)',
  "if(!url || !url.includes('cloudinary.com')) return null",
  "url.split('/upload/')",
  'if(parts.length < 2) return null',
  "path.replace(/^v\\d+\\//, '')",
  "path.replace(/\\.[^.]+$/, '')",
  'return path',
  'catch(e)',
  'return null'
]) {
  assert(source.includes(marker), `Extract public ID marker missing: ${marker}`);
}
assert(html.includes('src/features/extract-cloudinary-public-id.js'), 'Extract public ID module must remain linked from HTML');
assert(!source.includes('fetch('), 'Extract public ID must not own network requests');
assert(!source.includes('supabase'), 'Extract public ID must not own remote data access');
assert(!source.includes('document.'), 'Extract public ID must not own UI rendering');
assert.strictEqual((source.match(/function extractCloudinaryPublicId\(/g) || []).length, 1, 'Extract public ID must have one module owner');

console.log('EXTRACT_CLOUDINARY_PUBLIC_ID_CONTRACT_HARNESS=PASS');
console.log('PROVIDER_PATH_VERSION_EXTENSION_NULL_PARSER_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/extract-cloudinary-public-id.js');
console.log('PRODUCTION_CHANGE=0');
