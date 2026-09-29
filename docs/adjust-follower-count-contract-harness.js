const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'profile', 'adjust-follower-count.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const featureManifestSrc = fs.readFileSync(path.join(repo, 'src', 'loaders', 'feature-manifest.js'), 'utf8'); /* architecture-migration 2026-09-29 */

for (const marker of [
  'async function adjustFollowerCount(delta)',
  "document.getElementById('followers-count')",
  'if (!el) return',
  'parseInt(el.dataset.raw || 0) + delta',
  'Math.max(0, raw)',
  'el.dataset.raw = raw',
  'el.textContent = fmt(raw)'
]) {
  assert(source.includes(marker), `Adjust follower count marker missing: ${marker}`);
}
assert(featureManifestSrc.includes('"src/features/profile/adjust-follower-count.js"'), 'Adjust follower count module must remain linked from HTML (feature manifest — demand-loaded)'); /* architecture-migration 2026-09-29: profile demand loading */
assert(!source.includes('fetch('), 'Adjust follower count must not own network requests');
assert(!source.includes('supabase'), 'Adjust follower count must not own remote data access');
assert.strictEqual((source.match(/function adjustFollowerCount\(/g) || []).length, 1, 'Adjust follower count must have one module owner');

console.log('ADJUST_FOLLOWER_COUNT_CONTRACT_HARNESS=PASS');
console.log('GUARD_ARITHMETIC_NONNEGATIVE_DATASET_FORMAT_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/profile/adjust-follower-count.js');
console.log('PRODUCTION_CHANGE=0');
