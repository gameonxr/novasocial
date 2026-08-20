const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'avatar-creator.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

for (const marker of [
  'function showAvatarCreator()',
  "const m = modal('🧑‍🎤 Avatar Creator')",
  "const body = m.querySelector('#mbody')",
  'body.innerHTML = `',
  'Create Your Avatar',
  'Avatar Features',
  "['😎','🤓','🥸','🤠','👩‍🎤','👨‍🎤','🦸','🦹']",
  "i===0?'#E1306C':'#222'",
  'saveAvatar()',
  'function saveAvatar()',
  "toast('🧑‍🎤 Avatar saved! Ab tumhare comments me avatar dikhega.')",
  'closeModal()'
]) {
  assert(source.includes(marker), `Avatar creator marker missing: ${marker}`);
}
const backgroundPalette = "'linear-gradient(135deg,#833AB4,#E1306C)'";
assert(source.includes(backgroundPalette), 'Avatar creator must preserve the first background palette');
const backgroundChoices = source.match(/'linear-gradient\(135deg,[^']+'/g) || [];
assert.strictEqual(backgroundChoices.length, 6, 'Avatar creator must preserve six background choices');
assert.strictEqual((source.match(/<option>/g) || []).length, 6, 'Avatar creator must preserve six voice options');
assert(html.includes('src/features/avatar-creator.js'), 'Avatar creator module must remain linked from HTML');
assert(!source.includes('db.from('), 'Avatar creator must not own persistence');
assert(!source.includes('fetch('), 'Avatar creator must not own network requests');
assert(!source.includes('supabase'), 'Avatar creator must not own remote data access');
assert.strictEqual((source.match(/function (?:showAvatarCreator|saveAvatar)\(/g) || []).length, 2, 'Avatar creator must expose exactly two owned functions');

console.log('AVATAR_CREATOR_CONTRACT_HARNESS=PASS');
console.log('MODAL_FACE_BACKGROUND_VOICE_SAVE_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/avatar-creator.js');
console.log('PRODUCTION_CHANGE=0');
