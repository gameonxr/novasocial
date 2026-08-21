const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'update-crop-zoom.js'), 'utf8');

for (const marker of [
  'function updateCropZoom(sliderVal)',
  'const zoomPercent = parseInt(sliderVal) / 100',
  '_cropState.scale = _cropState.minScale * zoomPercent',
  "document.getElementById('crop-image')",
  'if(imgEl)',
  'translate(calc(-50% + ${_cropState.offsetX}px), calc(-50% + ${_cropState.offsetY}px)) scale(${_cropState.scale})'
]) {
  assert(source.includes(marker), `Update crop zoom marker missing: ${marker}`);
}
assert(!source.includes('fetch('), 'Update crop zoom must not own network requests');
assert(!source.includes('localStorage'), 'Update crop zoom must not own persistence');
assert.strictEqual((source.match(/function updateCropZoom\(/g) || []).length, 1, 'Update crop zoom must have one module owner');

console.log('UPDATE_CROP_ZOOM_CONTRACT_HARNESS=PASS');
console.log('SLIDER_NORMALIZATION_SCALE_STATE_GUARDED_IMAGE_TRANSFORM_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/update-crop-zoom.js');
console.log('PRODUCTION_CHANGE=0');
