const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'reply-helpers.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

const requiredMarkers = [
  'function replyMsg(id, text, name, mediaType, mediaUrl)',
  'window.replyToId=id',
  "document.getElementById('reply-preview')",
  "box.style.display='block'",
  "mediaType === 'image'",
  "previewContent = '📷 Photo'",
  "mediaType === 'video'",
  "previewContent = '🎬 Video'",
  "mediaType === 'audio'",
  "previewContent = '🎤 Voice Message'",
  "Replying to '",
  'document.getElementById(\'minp\')?.focus()',
  "document.getElementById('scroll-down-btn')",
  'const replyHeight = box.offsetHeight',
  'scrollBtn.style.bottom = (70 + replyHeight) + \'px\'',
  'function cancelReply()',
  'window.replyToId=null',
  "window.replyToText=''",
  "box.style.display='none'",
  "scrollBtn.style.bottom = '70px'"
];
for (const marker of requiredMarkers) {
  assert(source.includes(marker), `Reply preview marker missing: ${marker}`);
}
assert(html.includes('src/features/reply-helpers.js'), 'Reply helper module must remain linked from HTML');
assert(!source.includes('db.from('), 'Reply preview helper must not own database writes');
assert(!source.includes('sendCmt'), 'Reply preview helper must not own comment submission');
assert.strictEqual((source.match(/function replyMsg\(/g) || []).length, 1, 'Reply renderer must have one module owner');
assert.strictEqual((source.match(/function cancelReply\(/g) || []).length, 1, 'Reply cancellation must have one module owner');

console.log('REPLY_PREVIEW_CONTRACT_HARNESS=PASS');
console.log('STATE_MEDIA_FOCUS_SCROLL_CANCEL_OPTIONAL_DOM=LOCKED');
console.log('MODULE_OWNER=src/features/reply-helpers.js');
console.log('PRODUCTION_CHANGE=0');
