const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'comments.js'), 'utf8');

for (const marker of [
  'async function openComments(pid)',
  "modal('Comments')",
  "m.querySelector('#mbody')",
  "db.from('comments').select('id,user_id,text,created_at,profiles!comments_user_id_fkey(username,avatar_url)').eq('post_id',pid).order('created_at',{ascending:true}).limit(100)",
  "db.from('comments').select('id,user_id,text,created_at').eq('post_id',pid).order('created_at',{ascending:true}).limit(100)",
  "db.from('profiles').select('id,username,avatar_url').in('id', userIds)",
  "db.from('comment_likes').select('comment_id').eq('user_id', ME.id).in('comment_id', cmtIds)",
  'Pehla comment karo! 💬',
  "goToProfile('${c.user_id}')",
  "toggleCommentLike('${c.id}', this)",
  'id="ci-${pid}"',
  "sendCmt('${pid}')",
  'async function toggleCommentLike(cmid, btn)',
  "btn.dataset.liked === 'true'",
  "db.from('comment_likes').insert({ user_id: ME.id, comment_id: cmid })",
  "db.from('comment_likes').delete().eq('user_id', ME.id).eq('comment_id', cmid)",
  "sendNotif(cmt.user_id, 'comment_like'",
  'async function sendCmt(pid)',
  'if(isBannedClient()) return;',
  "document.getElementById('ci-'+pid)",
  'const txt=inp.value.trim();if(!txt)return;',
  "db.from('comments').insert({user_id:ME.id,post_id:pid,text:txt}).throwOnError()",
  "RATE_LIMIT_EXCEEDED",
  "toast('Comment post nahi hua 😕')",
  "db.from('posts').select('user_id').eq('id', pid).single()",
  "sendNotif(owner, 'comment'",
  'openComments(pid)'
]) {
  assert(source.includes(marker), `Comments marker missing: ${marker}`);
}
assert.strictEqual((source.match(/db\.from\('comments'\)/g) || []).length, 4, 'Comments must retain joined/fallback reads and insert plus owner-context read');
assert.strictEqual((source.match(/\.limit\(100\)/g) || []).length, 2, 'Comments must retain the hundred-item cap on both read paths');
assert.strictEqual((source.match(/db\.from\('comment_likes'\)/g) || []).length, 3, 'Comments must retain like read, insert, and delete paths');
assert.strictEqual((source.match(/sendNotif\(/g) || []).length, 2, 'Comments must retain like-owner and comment-owner notification paths');
assert.strictEqual((source.match(/isBannedClient\(\)/g) || []).length, 1, 'Comments must retain one moderation guard');
assert(!source.includes('openChat'), 'Comments must not own protected chat navigation');
assert(!source.includes('renderReels'), 'Comments must not own the protected Reels renderer');

console.log('COMMENTS_CONTRACT_HARNESS=PASS');
console.log('QUERY_FALLBACK_LIKES_EMPTY_RENDER_TOGGLE_MODERATION_RATE_LIMIT_NOTIFICATION_REFRESH_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/comments.js');
console.log('PRODUCTION_CHANGE=0');
