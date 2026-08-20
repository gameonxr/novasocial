const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'derive-video-thumbnail-url.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

for (const marker of [
  'function _deriveVideoThumbnailUrl(videoUrl)',
  "if (!videoUrl || typeof videoUrl !== 'string') return null",
  "videoUrl.includes('cloudinary.com')",
  "videoUrl.includes('/video/upload/')",
  "videoUrl.replace('/video/upload/', '/image/upload/')",
  "so_0,f_jpg,q_auto:good,w_800,c_limit",
  "thumbUrl.replace(/\\.(mp4|webm|mov|avi|m4v|mkv)$/i, '.jpg')",
  'catch(e)',
  'return null'
]) {
  assert(source.includes(marker), `Derive thumbnail URL marker missing: ${marker}`);
}
assert(html.includes('src/features/derive-video-thumbnail-url.js'), 'Derive thumbnail URL module must remain linked from HTML');
assert(!source.includes('document.'), 'Derive thumbnail URL must not own UI rendering');
assert(!source.includes('localStorage'), 'Derive thumbnail URL must not own persistence');
assert(!source.includes('fetch('), 'Derive thumbnail URL must not own network requests');
assert.strictEqual((source.match(/function _deriveVideoThumbnailUrl\(/g) || []).length, 1, 'Derive thumbnail URL must have one module owner');

console.log('DERIVE_VIDEO_THUMBNAIL_URL_CONTRACT_HARNESS=PASS');
console.log('GUARDS_CLOUDINARY_TRANSFORM_EXTENSION_FALLBACK_PURE_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/derive-video-thumbnail-url.js');
console.log('PRODUCTION_CHANGE=0');
