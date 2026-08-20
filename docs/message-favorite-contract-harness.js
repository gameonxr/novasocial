const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'favorite-message.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

assert(source.includes('async function favoriteMessage(mid)'), 'Favorite helper must preserve inline-call signature');
assert(source.includes("toast('Message Favorited ⭐')"), 'Favorite helper must preserve success toast');
assert(source.includes('closeModal()'), 'Favorite helper must close the active modal');
assert(!source.includes('db.from('), 'Favorite helper must not own database persistence');
assert(!source.includes('go('), 'Favorite helper must not own navigation');
assert(!source.includes('setSession'), 'Favorite helper must not own authentication');
assert(html.includes('src/features/favorite-message.js'), 'Favorite module must remain linked from HTML');
assert.strictEqual((source.match(/function favoriteMessage\(/g) || []).length, 1, 'Favorite helper must have one module owner');

console.log('MESSAGE_FAVORITE_CONTRACT_HARNESS=PASS');
console.log('INLINE_TOAST_MODAL_UI_ONLY_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/favorite-message.js');
console.log('PRODUCTION_CHANGE=0');
