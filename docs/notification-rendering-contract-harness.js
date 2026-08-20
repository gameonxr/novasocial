const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const moduleSource = fs.readFileSync(path.join(repo, 'src', 'features', 'notifications.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

const requiredMarkers = [
  'async function renderNotifs()',
  'const myGeneration = _renderGeneration',
  "from('notifications').select(`id,type,sender_id,recipient_id,post_id,conversation_id,story_id,is_read,message,created_at,sender:profiles!notifications_sender_id_fkey(username,avatar_url)`)",
  "from('follows').select('following_id')",
  "if(notifFilter !== 'all')",
  "const GROUP_TYPES = new Set(['like', 'follow'])",
  'next.post_id || null',
  'if(myGeneration !== _renderGeneration) return;',
  "update({is_read:true}).eq('recipient_id',ME.id).eq('is_read',false)",
  'async function notifClick(type, senderId, postId, conversationId, storyId)',
  'function setupNotifsRealtime()',
  "db.removeChannel(window.notifsSub)",
  "table:'notifications'",
  'recipient_id=eq.${ME.id}',
  'renderNotifs();'
];
for (const marker of requiredMarkers) {
  assert(moduleSource.includes(marker), `Notification rendering marker missing: ${marker}`);
}
assert(moduleSource.includes('followingSet.has(n.sender_id)'), 'Follow-back visibility must use the following set');
assert(moduleSource.includes("followBack('${n.sender_id}',this)"), 'Follow-back action must remain inline');
assert(moduleSource.includes("case 'story_reply':"), 'Story notification routing must remain present');
assert(moduleSource.includes("case 'message':"), 'Message notification routing must remain present');
assert(moduleSource.includes("case 'admin':"), 'Administrative notification routing must remain present');
assert(moduleSource.includes('window.notifsSub = db.channel'), 'Realtime subscription must remain window-owned');
assert(moduleSource.includes(".subscribe();"), 'Realtime subscription must remain active');
assert(html.includes('src/features/notifications.js'), 'Notification module must remain linked from HTML');
assert.strictEqual((moduleSource.match(/function renderNotifs\(/g) || []).length, 1, 'Notification renderer must have one module owner');

console.log('NOTIFICATION_RENDERING_CONTRACT_HARNESS=PASS');
console.log('QUERY_FILTER_GROUP_RACE_READ_REALTIME=LOCKED');
console.log('MODULE_OWNER=src/features/notifications.js');
console.log('PRODUCTION_CHANGE=0');
