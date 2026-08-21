const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'follow-list.js'), 'utf8');

for (const marker of [
  'async function showFollowList(userId, type)',
  "modal(type === 'followers' ? 'Followers' : 'Following')",
  "m.querySelector('#mbody')",
  '<div class="ldiv"><div class="spin"></div></div>',
  "fk = 'following_id'",
  "uk = 'follower_id'",
  "fk = 'follower_id'",
  "uk = 'following_id'",
  "db.from('follows').select(`profiles!follows_${uk}_fkey(username, avatar_url, id)`).eq(fk, userId)",
  'No ${type} yet.',
  "closeModal();showUserProfile('${u.id}')",
  'async function quickFollowFromList(uid, btn)',
  "btn.textContent.trim() === 'Following'",
  "btn.textContent = newFollowing ? 'Following' : 'Follow'",
  "btn.className = newFollowing ? 'bout' : 'bgrd'",
  "db.from('follows').insert({follower_id: ME.id, following_id: uid})",
  "sendNotif(uid, 'follow'",
  "db.from('follows').delete().eq('follower_id', ME.id).eq('following_id', uid)",
  "toast('Error')"
]) {
  assert(source.includes(marker), `Follow list marker missing: ${marker}`);
}
assert.strictEqual((source.match(/db\.from\('follows'\)/g) || []).length, 3, 'Follow list must retain one read, one insert, and one delete operation');
assert.strictEqual((source.match(/showUserProfile\('\$\{u\.id\}'\)/g) || []).length, 1, 'Follow list must use one profile-navigation template');
assert.strictEqual((source.match(/sendNotif\(uid, 'follow'/g) || []).length, 1, 'Follow list must notify once on the new-follow branch');
assert(!source.includes('renderDMs'), 'Follow list must not own the protected DM renderer');
assert(!source.includes('renderReels'), 'Follow list must not own the protected Reels renderer');
assert(!source.includes('deleteAccount'), 'Follow list must not own account deletion');

console.log('FOLLOW_LIST_CONTRACT_HARNESS=PASS');
console.log('MODAL_QUERY_INVERSION_LOADING_EMPTY_PROFILE_NAV_OPTIMISTIC_FOLLOW_PERSISTENCE_NOTIFICATION_ERROR_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/follow-list.js');
console.log('PRODUCTION_CHANGE=0');
