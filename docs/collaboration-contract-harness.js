const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'collaboration.js'), 'utf8');

for (const marker of [
  'async function showCollabPicker()',
  "modal('🤝 Add Co-Author')",
  "m.querySelector('#mbody')",
  '<div class="ldiv"><div class="spin"></div></div>',
  "db.from('follows').select('following_id, profiles!follows_following_id_fkey(username, avatar_url, id)').eq('follower_id', ME.id)",
  'No followings',
  'Collaborative Post',
  'id="collab-search"',
  'filterCollabList(this.value)',
  'id="collab-list"',
  "selectCollab('${u.id}','${u.username}')",
  'window._collabUsers = users',
  'function filterCollabList(q)',
  'window._collabUsers.filter',
  'No match',
  'function selectCollab(uid, uname)',
  'window._collabAuthor = {id:uid, username:uname}',
  "toast('🤝 Co-author: @'+uname)",
  'closeModal()',
  "document.getElementById('cbtn')",
  "cbtn.textContent = 'Share with Co-Author'"
]) {
  assert(source.includes(marker), `Collaboration marker missing: ${marker}`);
}
assert.strictEqual((source.match(/db\.from\('follows'\)/g) || []).length, 1, 'Collaboration must own one following query');
assert.strictEqual((source.match(/selectCollab\('\$\{u\.id\}','\$\{u\.username\}'\)/g) || []).length, 2, 'Collaboration must retain initial and filtered selection templates');
assert.strictEqual((source.match(/window\._collabUsers = users/g) || []).length, 1, 'Collaboration must cache users once');
assert.strictEqual((source.match(/window\._collabAuthor =/g) || []).length, 1, 'Collaboration must store one selected author');
assert(!source.includes('insert('), 'Collaboration picker must not create or persist posts');
assert(!source.includes('update('), 'Collaboration picker must not mutate remote post state');
assert(!source.includes('renderDMs'), 'Collaboration must not own the protected DM renderer');

console.log('COLLABORATION_CONTRACT_HARNESS=PASS');
console.log('PICKER_QUERY_LOADING_EMPTY_CACHE_FILTER_SELECTION_TOAST_CLOSE_CREATE_BUTTON_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/collaboration.js');
console.log('PRODUCTION_CHANGE=0');
