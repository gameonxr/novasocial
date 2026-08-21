const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'compress-image.js'), 'utf8');

for (const marker of [
  'async function _compressImage(file, config)',
  'return new Promise((resolve) => {',
  'if(file.size < 200 * 1024) { resolve(file); return; }',
  "document.createElement('canvas')",
  "canvas.getContext('2d')",
  'new Image()',
  'URL.createObjectURL(file)',
  'URL.revokeObjectURL(url)',
  'config.maxWidth || 1080',
  'config.maxHeight || 1080',
  'Math.min(maxW / width, maxH / height)',
  "ctx.fillStyle = '#000'",
  'ctx.drawImage(img, 0, 0, width, height)',
  "config.outputFormat || 'image/webp'",
  '(config.maxSizeMB || 1.5) * 1024 * 1024',
  'config.quality || 0.82',
  'q > 0.45',
  'q - 0.08',
  'canvas.toBlob((blob) => {',
  "_generateFileName(ME?.id, 'image')",
  'resolve(file); return;',
  'img.onerror'
]) {
  assert(source.includes(marker), `Compress image marker missing: ${marker}`);
}
assert.strictEqual((source.match(/resolve\(file\)/g) || []).length, 3, 'Compress image must preserve small-file, null-blob, and image-error original fallbacks');
assert.strictEqual((source.match(/URL\.revokeObjectURL\(url\)/g) || []).length, 2, 'Compress image must revoke the URL on load and error');
assert.strictEqual((source.match(/canvas\.toBlob/g) || []).length, 1, 'Compress image must use one recursive blob encoder');
assert(source.includes("parseFloat((q - 0.08).toFixed(2))"), 'Compress image must preserve quality decrement precision');
assert(!source.includes('fetch('), 'Compress image must not own network requests');
assert(!source.includes('supabase'), 'Compress image must remain client-side');

console.log('COMPRESS_IMAGE_CONTRACT_HARNESS=PASS');
console.log('SMALL_FILE_BYPASS_CANVAS_SCALE_DEFAULTS_QUALITY_LOOP_FORMAT_FILENAME_CLEANUP_FALLBACKS_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/compress-image.js');
console.log('PRODUCTION_CHANGE=0');
