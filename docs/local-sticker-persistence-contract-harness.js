const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const reader = fs.readFileSync(path.join(repo, 'src', 'features', 'get-local-stickers.js'), 'utf8');
const writer = fs.readFileSync(path.join(repo, 'src', 'features', 'save-local-sticker.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

const readerMarkers = [
  'function getLocalStickers(type)',
  "localStorage.getItem(type+'_stickers')",
  "JSON.parse(localStorage.getItem(type+'_stickers') || '[]')",
  "localStorage.removeItem(type+'_stickers')",
  'return []'
];
for (const marker of readerMarkers) {
  assert(reader.includes(marker), `Local-sticker reader marker missing: ${marker}`);
}
const writerMarkers = [
  'function saveLocalSticker(type, url)',
  'let arr = getLocalStickers(type)',
  'if(!arr.includes(url))',
  'arr.unshift(url)',
  'if(arr.length > 20) arr.pop()',
  "localStorage.setItem(type+'_stickers', JSON.stringify(arr))"
];
for (const marker of writerMarkers) {
  assert(writer.includes(marker), `Local-sticker writer marker missing: ${marker}`);
}
assert(html.includes('src/features/get-local-stickers.js'), 'Local-sticker reader must remain linked from HTML');
assert(html.includes('src/features/save-local-sticker.js'), 'Local-sticker writer must remain linked from HTML');
assert(!writer.includes('db.from('), 'Local-sticker writer must not own database writes');
assert(!writer.includes('sendSticker'), 'Local-sticker writer must not own sticker sending');
assert.strictEqual((reader.match(/function getLocalStickers\(/g) || []).length, 1, 'Local-sticker reader must have one module owner');
assert.strictEqual((writer.match(/function saveLocalSticker\(/g) || []).length, 1, 'Local-sticker writer must have one module owner');

console.log('LOCAL_STICKER_PERSISTENCE_CONTRACT_HARNESS=PASS');
console.log('KEY_ISOLATION_DUPLICATE_ORDER_CAP_MALFORMED_CLEANUP=LOCKED');
console.log('PRODUCTION_CHANGE=0');
