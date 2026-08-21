const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'favorite-message.js'), 'utf8');

for (const marker of [
  'async function favoriteMessage(mid)',
  "toast('Message Favorited ⭐')",
  'closeModal()'
]) {
  assert(source.includes(marker), `Favorite message marker missing: ${marker}`);
}
assert(!source.includes('fetch('), 'Favorite message must not own network requests');
assert(!source.includes('localStorage'), 'Favorite message must not own persistence');
assert(!source.includes('supabase'), 'Favorite message must not own remote mutation');
assert.strictEqual((source.match(/async function favoriteMessage\(/g) || []).length, 1, 'Favorite message must have one module owner');

console.log('FAVORITE_MESSAGE_CONTRACT_HARNESS=PASS');
console.log('TOAST_MODAL_CLOSE_PERSISTENCE_BOUNDARY_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/favorite-message.js');
console.log('PRODUCTION_CHANGE=0');
