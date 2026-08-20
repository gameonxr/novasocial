const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'open-sticker-picker.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

for (const marker of [
  'async function openStickerPicker(cid)',
  'window._stickerCid = cid',
  "activeStickerTab = 'recent'",
  "const m = modal('Stickers & GIFs')",
  "const body = m.querySelector('#mbody')",
  "body.innerHTML = ''",
  'sticker-upload',
  'type="file"',
  'accept="image/*"',
  'uploadCustomSticker',
  'showStickerTab',
  'recent',
  'tab-recent',
  'tab-fav',
  'tab-search',
  'sticker-content',
  'body.innerHTML = html'
]) {
  assert(source.includes(marker), `Open sticker picker marker missing: ${marker}`);
}
assert(html.includes('src/features/open-sticker-picker.js'), 'Open sticker picker module must remain linked from HTML');
assert(!source.includes('localStorage'), 'Open sticker picker must not own sticker persistence');
assert(!source.includes('fetch('), 'Open sticker picker must not own network requests');
assert.strictEqual((source.match(/function openStickerPicker\(/g) || []).length, 1, 'Open sticker picker must have one module owner');

console.log('OPEN_STICKER_PICKER_CONTRACT_HARNESS=PASS');
console.log('MODAL_UPLOAD_TABS_RECENT_INIT_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/open-sticker-picker.js');
console.log('PRODUCTION_CHANGE=0');
