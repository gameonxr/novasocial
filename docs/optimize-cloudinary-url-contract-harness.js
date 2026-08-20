const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'optimize-cloudinary-url.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

for (const marker of [
  'function optimizeCloudinaryUrl(url)',
  "if (!url || typeof url !== 'string') return url",
  "url.includes('cloudinary.com')",
  "url.includes('/video/upload/')",
  'const quality = getConnectionQuality()',
  "quality === 'good'",
  "quality === 'low' ? 'q_auto:low,f_auto' : 'q_auto:eco,f_auto'",
  "const uploadMarker = '/upload/'",
  "url.indexOf(uploadMarker)",
  'isTransformSegment',
  "q_auto:(good|low|eco|best)",
  'return url.slice(0, uploadIdx + uploadMarker.length) + combined',
  "return url.slice(0, uploadIdx + uploadMarker.length) + transformStr + '/' + afterUpload"
]) {
  assert(source.includes(marker), `Optimize Cloudinary URL marker missing: ${marker}`);
}
assert(html.includes('src/features/optimize-cloudinary-url.js'), 'Optimize Cloudinary URL module must remain linked from HTML');
assert(!source.includes('fetch('), 'Optimize Cloudinary URL must not own network requests');
assert(!source.includes('supabase'), 'Optimize Cloudinary URL must not own remote data access');
assert(!source.includes('document.'), 'Optimize Cloudinary URL must not own UI rendering');
assert.strictEqual((source.match(/function optimizeCloudinaryUrl\(/g) || []).length, 1, 'Optimize Cloudinary URL must have one module owner');

console.log('OPTIMIZE_CLOUDINARY_URL_CONTRACT_HARNESS=PASS');
console.log('GUARDS_VIDEO_QUALITY_REPLACE_INSERT_PURE_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/optimize-cloudinary-url.js');
console.log('PRODUCTION_CHANGE=0');
