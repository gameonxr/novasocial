const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'send-note-reply.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

const requiredMarkers = [
  'async function sendNoteReply(noteId, noteOwnerId)',
  "document.getElementById('note-reply-inp')",
  'const txt = inp?.value?.trim()',
  'if(!txt) return',
  'inp.value=\'\'',
  "from('conversation_members').select('conversation_id,conversations!inner(is_group)')",
  'filter(c=>!c.conversations.is_group)',
  "from('conversation_members').select('conversation_id').eq('user_id',noteOwnerId).in('conversation_id',oneOnOneIds)",
  "from('conversations').insert({is_group:false,created_by:ME.id}).select().single()",
  'db.from(\'conversation_members\').insert({conversation_id:cid,user_id:ME.id})',
  'db.from(\'conversation_members\').insert({conversation_id:cid,user_id:noteOwnerId})',
  "text:`💭 Replied to your note: ${txt}`",
  "toast('Reply sent! 💬')",
  "document.getElementById('note-view-overlay')?.remove()",
  "msgErr.message?.includes('MESSAGING_BLOCKED')",
  "toast(\"You can't send messages to this user\")",
  "toast('Reply failed')"
];
for (const marker of requiredMarkers) {
  assert(source.includes(marker), `Note-reply marker missing: ${marker}`);
}
assert(html.includes('src/features/send-note-reply.js'), 'Note-reply module must remain linked from HTML');
assert(!source.includes('renderDMs'), 'Note-reply helper must not own protected DM rendering');
assert(!source.includes('openChat'), 'Note-reply helper must not own chat navigation');
assert.strictEqual((source.match(/function sendNoteReply\(/g) || []).length, 1, 'Note-reply helper must have one module owner');

console.log('NOTE_REPLY_CONTRACT_HARNESS=PASS');
console.log('INPUT_REUSE_CREATE_MEMBERSHIP_MESSAGE_SUCCESS_BLOCKED_FAILURE=LOCKED');
console.log('MODULE_OWNER=src/features/send-note-reply.js');
console.log('PRODUCTION_CHANGE=0');
