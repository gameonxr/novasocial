const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'select-note-visibility.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

for (const marker of [
  'function selectNoteVisibility(v)',
  'window._noteVisibility = v',
  "['everyone','followers','close_friends']",
  '.forEach(vv=>',
  "document.getElementById('note-vis-'+vv)",
  "vv===v ? 'rgba(255,255,255,0.12)' : 'transparent'",
  "vv===v ? '#fff' : '#666'",
  "vv===v ? 'rgba(255,255,255,0.18)' : '#1a1a1a'"
]) {
  assert(source.includes(marker), `Select note visibility marker missing: ${marker}`);
}
assert(html.includes('src/features/select-note-visibility.js'), 'Select note visibility module must remain linked from HTML');
assert(!source.includes('fetch('), 'Select note visibility must not own network requests');
assert(!source.includes('supabase'), 'Select note visibility must not own remote data access');
assert(!source.includes('localStorage'), 'Select note visibility must not own persistence');
assert.strictEqual((source.match(/function selectNoteVisibility\(/g) || []).length, 1, 'Select note visibility must have one module owner');

console.log('SELECT_NOTE_VISIBILITY_CONTRACT_HARNESS=PASS');
console.log('STATE_OPTIONS_SELECTED_UNSELECTED_STYLES_UI_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/select-note-visibility.js');
console.log('PRODUCTION_CHANGE=0');
