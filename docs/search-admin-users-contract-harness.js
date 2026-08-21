const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'search-admin-users.js'), 'utf8');

for (const marker of [
  'async function searchAdminUsers(query)',
  'clearTimeout(_adminUserSearchTimer)',
  '_adminUserSearchTimer = setTimeout(async () => {',
  '}, 300);',
  "document.getElementById('admin-user-list')",
  "db.from('profiles').select('id,username,full_name,avatar_url,is_admin,is_banned,is_msg_banned,ban_reason,msg_ban_reason,created_at,last_seen,posts_count')",
  ".order('created_at',{ascending:false}).limit(50)",
  "if(query&&query.trim()) q = q.ilike('username','%'+query.trim()+'%')",
  'No users found',
  'Failed:',
  'esc(u.username)',
  'esc(u.full_name)',
  'ADMIN',
  'BANNED',
  'MSG-BANNED',
  "showAdminUserDetail('${u.id}')"
]) {
  assert(source.includes(marker), `Admin user search marker missing: ${marker}`);
}
assert.strictEqual((source.match(/setTimeout\(/g) || []).length, 1, 'Admin user search must use one debounce timer');
assert.strictEqual((source.match(/\.from\('profiles'\)/g) || []).length, 1, 'Admin user search must own one profiles query');
assert.strictEqual((source.match(/esc\(/g) || []).length, 2, 'Admin user search must escape username and full-name output');
assert.strictEqual((source.match(/showAdminUserDetail\('\$\{u\.id\}'\)/g) || []).length, 1, 'Admin user search must use one detail-navigation template');
assert.strictEqual((source.match(/\.limit\(50\)/g) || []).length, 1, 'Admin user search must retain the fifty-user cap');
assert(!source.includes('delete'), 'Admin user search must not own destructive operations');
assert(!source.includes('update('), 'Admin user search must remain read-only');
assert(!source.includes('fetch('), 'Admin user search must not own separate network requests');

console.log('SEARCH_ADMIN_USERS_CONTRACT_HARNESS=PASS');
console.log('DEBOUNCE_READ_QUERY_FIELDS_ORDER_FILTER_EMPTY_ERROR_ESCAPED_BADGES_DETAIL_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/search-admin-users.js');
console.log('PRODUCTION_CHANGE=0');
