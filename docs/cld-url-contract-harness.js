const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'cld-url.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

for (const marker of [
  'function cldUrl(url, transform)',
  "if (!url || typeof url !== 'string') return url",
  "url.includes('/upload/')",
  "if (!transform) return url",
  "url.replace('/upload/', `/upload/${transform}/`)"
]) {
  assert(source.includes(marker), `Cloudinary URL marker missing: ${marker}`);
}
assert(html.includes('src/features/cld-url.js'), 'Cloudinary URL module must remain linked from HTML');
assert(!source.includes('document.'), 'Cloudinary URL must not own UI rendering');
assert(!source.includes('localStorage'), 'Cloudinary URL must not own persistence');
assert(!source.includes('fetch('), 'Cloudinary URL must not own network requests');
assert.strictEqual((source.match(/function cldUrl\(/g) || []).length, 1, 'Cloudinary URL must have one module owner');

console.log('CLD_URL_CONTRACT_HARNESS=PASS');
console.log('PASSTHROUGH_UPLOAD_GUARD_TRANSFORM_INSERTION_PURE_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/cld-url.js');
console.log('PRODUCTION_CHANGE=0');
