const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'get-blocked-list.js'), 'utf8');

for (const marker of [
  'async function getBlockedList()',
  "db.from('blocks')",
  ".select('blocked_id')",
  ".eq('blocker_id', ME.id)",
  '(data || []).map(b => b.blocked_id)',
  'new Set('
]) {
  assert(source.includes(marker), `Get blocked list marker missing: ${marker}`);
}
assert(!source.includes('.insert('), 'Get blocked list must not insert block rows');
assert(!source.includes('.delete('), 'Get blocked list must not delete block rows');
assert(!source.includes('.update('), 'Get blocked list must not update block rows');
assert.strictEqual((source.match(/async function getBlockedList\(/g) || []).length, 1, 'Get blocked list must have one module owner');

console.log('GET_BLOCKED_LIST_CONTRACT_HARNESS=PASS');
console.log('READ_QUERY_USER_FILTER_EMPTY_FALLBACK_ROW_MAP_SET_CONVERSION_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/get-blocked-list.js');
console.log('PRODUCTION_CHANGE=0');
