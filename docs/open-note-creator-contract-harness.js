const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'open-note-creator.js'), 'utf8');
const music = fs.readFileSync(path.join(repo, 'src', 'features', 'render-note-music-section.js'), 'utf8');

for (const marker of [
  'function openNoteCreator()',
  "modal(_myActiveNote ? 'Edit Note' : 'New Note')",
  "window._noteVisibility = _myActiveNote?.visibility || 'followers'",
  'window._noteMusic = _myActiveNote?.music_title ?',
  "window._noteTextDraft = _myActiveNote?.text || ''",
  "id=\"note-text-inp\" maxlength=\"60\"",
  'window._noteTextDraft.replace(/</g,\'&lt;\')',
  'id=\"note-char-count\"',
  "selectNoteVisibility('${v}')",
  'onclick="submitNote()"',
  'onclick="deleteMyNote()"',
  "addEventListener('input', function()",
  'renderNoteMusicSection()'
]) {
  assert(source.includes(marker), `Open note creator marker missing: ${marker}`);
}
assert(music.includes('function renderNoteMusicSection()'), 'Open note creator must retain music-section delegation');
assert(!source.includes('fetch('), 'Open note creator must not own network requests');
assert(!source.includes('supabase'), 'Open note creator must not own note persistence');
assert.strictEqual((source.match(/function openNoteCreator\(/g) || []).length, 1, 'Open note creator must have one module owner');

console.log('OPEN_NOTE_CREATOR_CONTRACT_HARNESS=PASS');
console.log('MODAL_MODE_STATE_INIT_DRAFT_ESCAPE_COMPOSER_CONTROLS_DELEGATION_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/open-note-creator.js');
console.log('PRODUCTION_CHANGE=0');
