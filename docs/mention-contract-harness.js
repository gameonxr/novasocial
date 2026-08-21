const assert = require('assert');
const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'features', 'mention.js'), 'utf8');

for (const marker of [
  'let mentionSearchTimer = null',
  'async function checkMentionInCaption(textarea)',
  'textarea.selectionStart',
  'beforeCursor.match(/@([a-zA-Z0-9._]+)$/)',
  "document.getElementById('mention-suggestions')",
  'clearTimeout(mentionSearchTimer)',
  'mentionSearchTimer = setTimeout(async () =>',
  '}, 300);',
  "db.from('profiles')",
  ".select('id,username,avatar_url,full_name')",
  ".ilike('username', '%' + query + '%')",
  ".neq('id', ME.id)",
  '.limit(5)',
  'function insertMentionIntoCaption(username, userId)',
  "document.getElementById('capinp')",
  "'@' + username + ' '",
  'textarea.setSelectionRange(newCursorPos, newCursorPos)',
  'window._mentionedUsers',
  'async function sendMentionNotifications(postId)',
  "sendNotif(user.id, 'mention'",
  'window._mentionedUsers = [];',
  'function toggleScheduleMode(btn)',
  "document.getElementById('schedule-input-wrap')",
  "wrap.style.display === 'flex'",
  'window._scheduleTime = null',
  'Date.now()+3600000',
  "document.getElementById('schedule-time')"
]) {
  assert(source.includes(marker), `Mention marker missing: ${marker}`);
}
assert.strictEqual((source.match(/function |async function /g) || []).length, 4, 'mention module must retain four public helper functions');
assert.strictEqual((source.match(/document\.getElementById\(/g) || []).length, 5, 'mention module must retain its five DOM boundaries');
assert.strictEqual((source.match(/sendNotif\(/g) || []).length, 1, 'mention module must retain one notification delegation boundary');
assert(source.includes("suggestionsDiv.style.display = 'none'"), 'mention module must hide empty or invalid suggestions');
assert(source.includes("suggestionsDiv.style.display = 'block'"), 'mention module must show populated suggestions');
assert(source.includes("if(!window._mentionedUsers) window._mentionedUsers = []"), 'mention insertion must initialize the staged-user list');
assert(source.includes('for(const user of window._mentionedUsers)'), 'mention notifications must iterate staged users');
assert(!source.includes('navigator.mediaDevices'), 'mention module must not own media systems');
assert(!source.includes('signInWithPassword'), 'mention module must not own authentication');

console.log('MENTION_CONTRACT_HARNESS=PASS');
console.log('CAPTION_SEARCH_INSERT_NOTIFICATION_SCHEDULE_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/mention.js');
console.log('PRODUCTION_CHANGE=0');
