const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'close-friends.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

const requiredMarkers = [
  'async function showCloseFriendsManager()',
  "modal('⭐ Close Friends')",
  "body.innerHTML = `<div class=\"ldiv\"><div class=\"spin\"></div></div>`",
  "from('follows').select('following_id, profiles!follows_following_id_fkey(username, avatar_url, id)')",
  ".eq('follower_id', ME.id)",
  "JSON.parse(PROF.close_friends || '[]')",
  'const cfSet = new Set(cfIds)',
  'if(!users.length)',
  'Koi following nahi',
  'toggleCloseFriend(\'${u.id}\')',
  'cfSet.has(u.id)',
  'async function toggleCloseFriend(uid)',
  'const idx = cfIds.indexOf(uid)',
  'cfIds.splice(idx, 1)',
  'cfIds.push(uid)',
  "update({close_friends: JSON.stringify(cfIds)})",
  "PROF.close_friends = JSON.stringify(cfIds)",
  "document.getElementById('cfbtn-'+uid)",
  "toast('Error: '+e.message)"
];
for (const marker of requiredMarkers) {
  assert(source.includes(marker), `Close Friends marker missing: ${marker}`);
}
assert(html.includes('src/features/close-friends.js'), 'Close Friends module must remain linked from HTML');
assert.strictEqual((source.match(/function showCloseFriendsManager\(/g) || []).length, 1, 'Close Friends manager must have one module owner');
assert.strictEqual((source.match(/function toggleCloseFriend\(/g) || []).length, 1, 'Close Friends toggle must have one module owner');

console.log('CLOSE_FRIENDS_CONTRACT_HARNESS=PASS');
console.log('FOLLOWING_EMPTY_JSON_TOGGLE_PERSIST_BUTTON_ERROR=LOCKED');
console.log('MODULE_OWNER=src/features/close-friends.js');
console.log('PRODUCTION_CHANGE=0');
