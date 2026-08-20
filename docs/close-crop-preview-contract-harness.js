const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'close-crop-preview.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

for (const marker of [
  'function closeCropPreview()',
  "document.getElementById('nova-crop-modal')?.remove()",
  '_cropState = {',
  'file: null',
  'imgEl: null',
  'scale: 1',
  'minScale: 1',
  'offsetX: 0',
  'offsetY: 0',
  'startX: 0',
  'startY: 0',
  'isDragging: false',
  "cropType: 'avatar'",
  'onConfirm: null'
]) {
  assert(source.includes(marker), `Close crop preview marker missing: ${marker}`);
}
assert(html.includes('src/features/close-crop-preview.js'), 'Close crop preview module must remain linked from HTML');
assert(!source.includes('fetch('), 'Close crop preview must not own network requests');
assert(!source.includes('supabase'), 'Close crop preview must not own remote data access');
assert(!source.includes('createObjectURL'), 'Close crop preview must not own media processing');
assert.strictEqual((source.match(/function closeCropPreview\(/g) || []).length, 1, 'Close crop preview must have one module owner');

console.log('CLOSE_CROP_PREVIEW_CONTRACT_HARNESS=PASS');
console.log('MODAL_REMOVAL_COMPLETE_STATE_RESET_CLEANUP_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/close-crop-preview.js');
console.log('PRODUCTION_CHANGE=0');
