const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'message-info.js'), 'utf8');

for (const marker of [
  'async function showMsgInfo(mid)',
  "const m = modal('Message Info')",
  "body.innerHTML = '<div class=\"ldiv\"><div class=\"spin\"></div></div>'",
  "db.from('messages').select('created_at, seen_at').eq('id', mid).single()",
  "db.from('message_reads').select('read_at, profiles!message_reads_user_id_fkey(username)').eq('message_id', mid)",
  "new Date(msg.created_at).toLocaleString()",
  'if(msg.seen_at)',
  'reads.forEach(r =>',
  'Not read yet',
  'body.innerHTML = html'
]) {
  assert(source.includes(marker), `Message info marker missing: ${marker}`);
}
assert(!source.includes('.insert('), 'Message info must not insert message data');
assert(!source.includes('.update('), 'Message info must not update message data');
assert(!source.includes('.delete('), 'Message info must not delete message data');
assert.strictEqual((source.match(/async function showMsgInfo\(/g) || []).length, 1, 'Message info must have one module owner');

console.log('MESSAGE_INFO_CONTRACT_HARNESS=PASS');
console.log('MODAL_LOADING_MESSAGE_READ_QUERY_SENT_DELIVERED_READERS_EMPTY_STATE_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/message-info.js');
console.log('PRODUCTION_CHANGE=0');
