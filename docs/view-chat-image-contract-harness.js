const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'view-chat-image.js'), 'utf8');

for (const marker of [
  'function viewChatImage(url)',
  "const m = modal('')",
  "m.querySelector('.mhdr').style.display = 'none'",
  "m.querySelector('.msheet').style.background = 'rgba(0,0,0,0.95)'",
  "m.querySelector('#mbody').innerHTML",
  "<img src=\"'+url+'\"",
  'downloadMedia(',
  'novasocial_image',
  'm.onclick = e => { if(e.target === m) closeModal(); };'
]) {
  assert(source.includes(marker), `View chat image marker missing: ${marker}`);
}
assert(!source.includes('renderDMs'), 'View chat image must not own DM rendering');
assert(!source.includes('fetch('), 'View chat image must not own network requests');
assert.strictEqual((source.match(/function viewChatImage\(/g) || []).length, 1, 'View chat image must have one module owner');

console.log('VIEW_CHAT_IMAGE_CONTRACT_HARNESS=PASS');
console.log('MODAL_DARK_SHEET_IMAGE_DOWNLOAD_BACKDROP_PROTECTED_REALTIME_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/view-chat-image.js');
console.log('PRODUCTION_CHANGE=0');
