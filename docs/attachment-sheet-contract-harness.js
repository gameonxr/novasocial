const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'dms', 'attachment-sheet.js') /* architecture-migration 2026-09-29: dms folder */, 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const featureManifestSrc = fs.readFileSync(path.join(repo, 'src', 'loaders', 'feature-manifest.js'), 'utf8'); /* architecture-migration 2026-09-29 */

const requiredMarkers = [
  'function toggleAttachmentSheet(cid)',
  "modal('Attachments')",
  "document.getElementById(\\'dm-file-pick\\').click()",
  "document.getElementById(\\'dm-cam-pick\\').click()",
  'shareLocation(',
  'openStickerPicker(',
  'id="dm-file-pick"',
  'type="file"',
  'accept="image/*,video/*"',
  'onchange="closeModal(); sendMediaMsg(',
  'id="dm-cam-pick"',
  'accept="image/*"',
  'capture="environment"',
  'onchange="closeModal(); sendMediaMsg(' ,
  'Gallery',
  'Camera',
  'Location',
  'Sticker'
];
for (const marker of requiredMarkers) {
  assert(source.includes(marker), `Attachment-sheet marker missing: ${marker}`);
}
assert(featureManifestSrc.includes('"src/features/dms/attachment-sheet.js"'), 'Attachment-sheet module must remain linked from HTML (feature manifest — demand-loaded)'); /* architecture-migration 2026-09-29: demand loading */
assert(!source.includes('db.from('), 'Attachment-sheet renderer must not own persistence');
assert.strictEqual((source.match(/function toggleAttachmentSheet\(/g) || []).length, 1, 'Attachment-sheet renderer must have one module owner');

console.log('ATTACHMENT_SHEET_CONTRACT_HARNESS=PASS');
console.log('GALLERY_CAMERA_LOCATION_STICKER_FILE_CALLBACKS_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/dms/attachment-sheet.js');
console.log('PRODUCTION_CHANGE=0');
