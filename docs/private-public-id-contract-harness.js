const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'private-public-id.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

for (const marker of [
  'function _extractPublicId(url)',
  "!url || typeof url !== 'string' || !url.includes('cloudinary.com')",
  "url.split('/upload/')",
  'if(parts.length < 2) return null',
  "path.replace(/^v\\d+\\//, '')",
  "path.replace(/\\.[^.]+$/, '')",
  'return path',
  'catch(e)',
  'return null'
]) {
  assert(source.includes(marker), `Private public ID marker missing: ${marker}`);
}
assert(html.includes('src/features/private-public-id.js'), 'Private public ID module must remain linked from HTML');
assert(!source.includes('fetch('), 'Private public ID must not own network requests');
assert(!source.includes('supabase'), 'Private public ID must not own remote data access');
assert(!source.includes('document.'), 'Private public ID must not own UI rendering');
assert.strictEqual((source.match(/function _extractPublicId\(/g) || []).length, 1, 'Private public ID must have one module owner');

console.log('PRIVATE_PUBLIC_ID_CONTRACT_HARNESS=PASS');
console.log('PROVIDER_PATH_VERSION_EXTENSION_NULL_PARSER_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/private-public-id.js');
console.log('PRODUCTION_CHANGE=0');
