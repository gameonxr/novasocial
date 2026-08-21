const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'message-clipboard-helpers.js'), 'utf8');

for (const marker of [
  'async function copyMsg(id, text)',
  'navigator.clipboard.writeText(text)',
  "toast('Message copied! 📋')",
  "toast('Could not copy')",
  "document.getElementById('react-box')",
  'function copyMsgFromEnc(encText)',
  "decodeURIComponent(encText || '')",
  'navigator.clipboard.writeText(text).then(() => toast',
  'closeModal()'
]) {
  assert(source.includes(marker), `Message clipboard helper marker missing: ${marker}`);
}
assert(!source.includes('fetch('), 'Message clipboard helpers must not own network requests');
assert(!source.includes('sendMessage'), 'Message clipboard helpers must not own message sending');
assert.strictEqual((source.match(/(?:async )?function (?:copyMsg|copyMsgFromEnc)\(/g) || []).length, 2, 'Message clipboard helpers must have two module functions');

console.log('MESSAGE_CLIPBOARD_HELPERS_CONTRACT_HARNESS=PASS');
console.log('CLIPBOARD_WRITE_DECODE_TOAST_REACTION_CLEANUP_MODAL_CLOSE_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/message-clipboard-helpers.js');
console.log('PRODUCTION_CHANGE=0');
