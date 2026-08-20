const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'generate-file-name.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

for (const marker of [
  'function _generateFileName(userId, mediaType)',
  'const ts = Date.now()',
  "Math.random().toString(36).substr(2, 6)",
  "(userId || 'u').substr(0, 8)",
  "mediaType === 'video' ? 'mp4' : 'webp'",
  'return `${uid}_${ts}_${rand}.${ext}`'
]) {
  assert(source.includes(marker), `Generate file name marker missing: ${marker}`);
}
assert(html.includes('src/features/generate-file-name.js'), 'Generate file name module must remain linked from HTML');
assert(!source.includes('document.'), 'Generate file name must not own UI rendering');
assert(!source.includes('localStorage'), 'Generate file name must not own local persistence');
assert(!source.includes('fetch('), 'Generate file name must not own network requests');
assert(!source.includes('supabase'), 'Generate file name must not own remote data access');
assert.strictEqual((source.match(/function _generateFileName\(/g) || []).length, 1, 'Generate file name must have one module owner');

console.log('GENERATE_FILE_NAME_CONTRACT_HARNESS=PASS');
console.log('USER_BOUND_TIMESTAMP_RANDOM_EXTENSION_PURE_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/generate-file-name.js');
console.log('PRODUCTION_CHANGE=0');
