const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'show-nova-universe-overview.js'), 'utf8');

for (const marker of [
  'async function showNovaUniverseOverview()',
  'NOVA UNIVERSE',
  'Social Media',
  'Messaging',
  'Calls',
  'AI Assistant',
  'Notes',
  'Calendar',
  'Communities',
  'Marketplace',
  'Learning',
  'News',
  'Games',
  'Profile'
]) {
  assert(source.includes(marker), `Nova Universe overview marker missing: ${marker}`);
}
assert.strictEqual((source.match(/return `/g) || []).length, 1, 'Nova Universe overview must return one stable response');
assert(!source.includes('fetch('), 'Nova Universe overview must not own network requests');
assert(!source.includes('modal('), 'Nova Universe overview must not open UI directly');
assert(!source.includes('document.'), 'Nova Universe overview must remain side-effect free');
assert(!source.includes('supabase'), 'Nova Universe overview must not own persistence');

console.log('SHOW_NOVA_UNIVERSE_OVERVIEW_CONTRACT_HARNESS=PASS');
console.log('ASYNC_SIGNATURE_STABLE_SECTIONS_NAVIGATION_HINT_SIDE_EFFECT_FREE_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/show-nova-universe-overview.js');
console.log('PRODUCTION_CHANGE=0');
