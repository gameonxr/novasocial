const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'get-blocked-both-ways-set.js'), 'utf8');

for (const marker of [
  'async function getBlockedBothWaysSet()',
  'const [iBlocked, blockedMe] = await Promise.all([',
  "db.from('blocks').select('blocked_id').eq('blocker_id', ME.id)",
  "db.from('blocks').select('blocker_id').eq('blocked_id', ME.id)",
  'const set = new Set()',
  '(iBlocked.data || []).forEach(r => set.add(r.blocked_id))',
  '(blockedMe.data || []).forEach(r => set.add(r.blocker_id))',
  'return set'
]) {
  assert(source.includes(marker), `Get blocked both ways marker missing: ${marker}`);
}
assert(!source.includes('.insert('), 'Get blocked both ways must not insert block rows');
assert(!source.includes('.delete('), 'Get blocked both ways must not delete block rows');
assert(!source.includes('.update('), 'Get blocked both ways must not update block rows');
assert.strictEqual((source.match(/async function getBlockedBothWaysSet\(/g) || []).length, 1, 'Get blocked both ways must have one module owner');

console.log('GET_BLOCKED_BOTH_WAYS_SET_CONTRACT_HARNESS=PASS');
console.log('PARALLEL_DIRECTIONAL_READS_RECIPROCAL_FILTERS_EMPTY_FALLBACK_SET_UNION_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/get-blocked-both-ways-set.js');
console.log('PRODUCTION_CHANGE=0');
