const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'chat-input-helpers.js'), 'utf8');

for (const marker of [
  'function toggleSendBtn()',
  "document.getElementById('minp')?.value.trim()",
  "document.getElementById('cam-icon')",
  "document.getElementById('mic-btn')",
  "document.getElementById('send-icon')",
  "document.querySelector('.chat-pill')",
  'if(!cam || !mic || !send || !pill) return',
  'if(txt)',
  "cam.classList.add('icon-hidden')",
  "send.classList.remove('icon-hidden')",
  "pill.classList.add('expanded')",
  "cam.classList.remove('icon-hidden')",
  "send.classList.add('icon-hidden')",
  'document.activeElement !== document.getElementById(\'minp\')',
  'function autoGrow(el)',
  "el.style.height = 'auto'",
  "el.style.height = (el.scrollHeight) + 'px'",
  "if(el.scrollHeight > 100) el.style.overflowY = 'auto'",
  "else el.style.overflowY = 'hidden'"
]) {
  assert(source.includes(marker), `Chat input helper marker missing: ${marker}`);
}
assert(!source.includes('sendMessage'), 'Chat input helpers must not own message sending');
assert(!source.includes('fetch('), 'Chat input helpers must not own network requests');
assert.strictEqual((source.match(/function (?:toggleSendBtn|autoGrow)\(/g) || []).length, 2, 'Chat input helpers must have two module functions');

console.log('CHAT_INPUT_HELPERS_CONTRACT_HARNESS=PASS');
console.log('REQUIRED_GUARD_SEND_BRANCHES_PILL_FOCUS_AUTOGROW_THRESHOLD_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/chat-input-helpers.js');
console.log('PRODUCTION_CHANGE=0');
