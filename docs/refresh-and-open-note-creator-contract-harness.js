const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'refresh-and-open-note-creator.js'), 'utf8');
const creator = fs.readFileSync(path.join(repo, 'src', 'features', 'open-note-creator.js'), 'utf8');

for (const marker of [
  'async function refreshAndOpenNoteCreator()',
  'db.from(\'quick_notes\')',
  '.select(\'*\')',
  '.eq(\'user_id\',ME.id)',
  '.gt(\'expires_at\',new Date().toISOString())',
  '.order(\'created_at\',{ascending:false})',
  '.limit(1)',
  '.maybeSingle()',
  'latestNote',
  '_myActiveNote = latestNote',
  'setTimeout(()=>{ openNoteCreator(); }, 200);'
]) {
  assert(source.includes(marker), `Refresh note creator marker missing: ${marker}`);
}
assert(creator.includes('function openNoteCreator()'), 'Refresh helper must retain the note creator delegation target');
assert(!source.includes('insert('), 'Refresh helper must not insert notes');
assert(!source.includes('update('), 'Refresh helper must not update notes');
assert(!source.includes('delete('), 'Refresh helper must not delete notes');
assert.strictEqual((source.match(/async function refreshAndOpenNoteCreator\(/g) || []).length, 1, 'Refresh note creator must have one module owner');

console.log('REFRESH_AND_OPEN_NOTE_CREATOR_CONTRACT_HARNESS=PASS');
console.log('BOUNDED_QUERY_FILTER_ORDER_ASSIGNMENT_DELAYED_OPEN_PROTECTED_DB_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/refresh-and-open-note-creator.js');
console.log('PRODUCTION_CHANGE=0');
