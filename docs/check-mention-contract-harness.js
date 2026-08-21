const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'check-mention.js'), 'utf8');
const insertion = fs.readFileSync(path.join(repo, 'src', 'features', 'insert-mention.js'), 'utf8');

for (const marker of [
  'function checkMention(inp, cid)',
  'const val = inp.value',
  "const words = val.split(' ')",
  'const lastWord = words[words.length - 1]',
  "document.getElementById('mention-list')",
  "lastWord.startsWith('@') && lastWord.length < 20",
  'lastWord.substring(1).toLowerCase()',
  'window._chatMembers || []',
  'm.profiles.username.toLowerCase().includes(query)',
  'm.user_id !== ME.id',
  "list.id = 'mention-list'",
  'insertMention(',
  'minp',
  'existingList?.remove()'
]) {
  assert(source.includes(marker), `Check mention marker missing: ${marker}`);
}
assert(insertion.includes('function insertMention('), 'Mention autocomplete must retain the insertMention delegation target');
assert(!source.includes('fetch('), 'Check mention must not own network requests');
assert(!source.includes('sendMessage'), 'Check mention must not own message sending');
assert.strictEqual((source.match(/function checkMention\(/g) || []).length, 1, 'Check mention must have one module owner');

console.log('CHECK_MENTION_CONTRACT_HARNESS=PASS');
console.log('TOKEN_QUERY_MEMBER_FILTER_CURRENT_USER_EXCLUSION_LIST_LIFECYCLE_INSERT_DELEGATION_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/check-mention.js');
console.log('PRODUCTION_CHANGE=0');
