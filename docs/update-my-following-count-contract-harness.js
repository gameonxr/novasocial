const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'update-my-following-count.js'), 'utf8');

for (const marker of [
  'async function updateMyFollowingCount(delta)',
  "document.getElementById('following-count')",
  'if (fel)',
  "parseInt(fel.dataset.raw || 0) + delta",
  'raw = Math.max(0, raw)',
  'fel.dataset.raw = raw',
  'fel.textContent = fmt(raw)'
]) {
  assert(source.includes(marker), `Update following count marker missing: ${marker}`);
}
assert(!source.includes('fetch('), 'Update following count must not own network requests');
assert(!source.includes('localStorage'), 'Update following count must not own persistence');
assert.strictEqual((source.match(/async function updateMyFollowingCount\(/g) || []).length, 1, 'Update following count must have one module owner');

console.log('UPDATE_MY_FOLLOWING_COUNT_CONTRACT_HARNESS=PASS');
console.log('GUARDED_LOOKUP_PARSE_DELTA_NONNEGATIVE_CLAMP_DATASET_FORMAT_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/update-my-following-count.js');
console.log('PRODUCTION_CHANGE=0');
