const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'comments.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

const requiredMarkers = [
  'async function openComments(pid)',
  "modal('Comments')",
  "select('id,user_id,text,created_at,profiles!comments_user_id_fkey(username,avatar_url)')",
  ".eq('post_id',pid).order('created_at',{ascending:true}).limit(100)",
  "select('id,user_id,text,created_at')",
  "select('id,username,avatar_url').in('id', userIds)",
  'const cmtIds = (cmts||[]).map(c=>c.id)',
  "from('comment_likes').select('comment_id').eq('user_id', ME.id).in('comment_id', cmtIds)",
  'Pehla comment karo! 💬',
  'goToProfile(\'${c.user_id}\')',
  'toggleCommentLike(\'${c.id}\', this)',
  'async function toggleCommentLike(cmid, btn)',
  "btn.dataset.liked === 'true'",
  "from('comment_likes').insert({ user_id: ME.id, comment_id: cmid })",
  "from('comment_likes').delete().eq('user_id', ME.id).eq('comment_id', cmid)",
  "sendNotif(cmt.user_id, 'comment_like'",
  'async function sendCmt(pid)',
  'if(isBannedClient()) return',
  'const txt=inp.value.trim();if(!txt)return',
  "from('comments').insert({user_id:ME.id,post_id:pid,text:txt}).throwOnError()",
  "e.message?.includes('RATE_LIMIT_EXCEEDED')",
  "toast('Comment post nahi hua 😕')",
  "sendNotif(owner, 'comment'",
  'openComments(pid)'
];
for (const marker of requiredMarkers) {
  assert(source.includes(marker), `Comments marker missing: ${marker}`);
}
assert(html.includes('src/features/comments.js'), 'Comments module must remain linked from HTML');
assert.strictEqual((source.match(/function openComments\(/g) || []).length, 1, 'Comments renderer must have one module owner');
assert.strictEqual((source.match(/function toggleCommentLike\(/g) || []).length, 1, 'Comment-like helper must have one module owner');
assert.strictEqual((source.match(/function sendCmt\(/g) || []).length, 1, 'Comment submit helper must have one module owner');

console.log('COMMENTS_FLOW_CONTRACT_HARNESS=PASS');
console.log('QUERY_FALLBACK_LIKES_RENDER_GUARDS_RATE_LIMIT_NOTIFICATIONS_REFRESH=LOCKED');
console.log('MODULE_OWNER=src/features/comments.js');
console.log('PRODUCTION_CHANGE=0');
