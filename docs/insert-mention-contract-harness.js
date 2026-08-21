const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'insert-mention.js'), 'utf8');

for (const marker of [
  'function insertMention(username, inpId)',
  'document.getElementById(inpId)',
  "let words = inp.value.split(' ')",
  "words[words.length - 1] = '@' + username + ' '",
  "inp.value = words.join(' ')",
  "document.getElementById('mention-list')?.remove()",
  'inp.focus()'
]) {
  assert(source.includes(marker), `Insert mention marker missing: ${marker}`);
}
assert(!source.includes('fetch('), 'Insert mention must not own network requests');
assert(!source.includes('sendMessage'), 'Insert mention must not own message sending');
assert.strictEqual((source.match(/function insertMention\(/g) || []).length, 1, 'Insert mention must have one module owner');

console.log('INSERT_MENTION_CONTRACT_HARNESS=PASS');
console.log('INPUT_LOOKUP_LAST_TOKEN_REPLACEMENT_TRAILING_SPACE_LIST_CLEANUP_FOCUS_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/insert-mention.js');
console.log('PRODUCTION_CHANGE=0');
