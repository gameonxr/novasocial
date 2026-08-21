const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'show-blocked-list.js'), 'utf8');

for (const marker of [
  'async function showBlockedList()',
  "const m = modal('Blocked Accounts')",
  "body.innerHTML = '<div class=\"ldiv\"><div class=\"spin\"></div></div>'",
  "db.from('blocks').select('blocked_id, profiles!blocks_blocked_id_fkey(username, avatar_url, id)').eq('blocker_id', ME.id)",
  'const blocked = (data || []).map(d => d.profiles).filter(Boolean)',
  'No blocked accounts.',
  'blocked.map(u =>',
  'unblockUser(\'${u.id}\', this)'
]) {
  assert(source.includes(marker), `Show blocked list marker missing: ${marker}`);
}
assert(!source.includes('.insert('), 'Show blocked list must not insert block rows');
assert(!source.includes('.delete('), 'Show blocked list must not delete block rows');
assert(!source.includes('.update('), 'Show blocked list must not update block rows');
assert.strictEqual((source.match(/async function showBlockedList\(/g) || []).length, 1, 'Show blocked list must have one module owner');

console.log('SHOW_BLOCKED_LIST_CONTRACT_HARNESS=PASS');
console.log('MODAL_LOADING_QUERY_PROFILE_MAP_EMPTY_ROWS_UNBLOCK_DELEGATION_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/show-blocked-list.js');
console.log('PRODUCTION_CHANGE=0');
