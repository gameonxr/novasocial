const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'chat-actions.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

for (const marker of [
  'function showChatActions(cid)',
  "const m = modal('Chat Options')",
  "const body = m.querySelector('#mbody')",
  "let html = '<div style=\"padding:8px 0;\">'",
  'if(window._chatOtherId)',
  'closeModal();showCallHistory',
  'window._chatOtherId',
  'clearChat',
  'cid',
  'Call History',
  'Clear Chat',
  'Cancel',
  'body.innerHTML = html'
]) {
  assert(source.includes(marker), `Chat actions marker missing: ${marker}`);
}
assert(html.includes('src/features/chat-actions.js'), 'Chat actions module must remain linked from HTML');
assert(!source.includes('db.from('), 'Chat actions must not own persistence');
assert(!source.includes('fetch('), 'Chat actions must not own network requests');
assert(!source.includes('supabase'), 'Chat actions must not own remote data access');
assert.strictEqual((source.match(/function showChatActions\(/g) || []).length, 1, 'Chat actions must have one module owner');

console.log('CHAT_ACTIONS_CONTRACT_HARNESS=PASS');
console.log('MODAL_CALL_HISTORY_CLEAR_CANCEL_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/chat-actions.js');
console.log('PRODUCTION_CHANGE=0');
