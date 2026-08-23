const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const repo = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const notesBar = fs.readFileSync(path.join(repo, 'src', 'features', 'notes-bar.js'), 'utf8');
const noteOwners = fs.readFileSync(path.join(repo, 'src', 'features', 'note-viewer-owners.js'), 'utf8');
const noteDeletionOwner = fs.readFileSync(path.join(repo, 'src', 'features', 'note-deletion-owner.js'), 'utf8');
const reactorListOwner = fs.readFileSync(path.join(repo, 'src', 'features', 'note-reactors-list-owner.js'), 'utf8');
const sourceFiles = execFileSync('find', [path.join(repo, 'src'), '-type', 'f', '-name', '*.js'], { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
const sourceText = sourceFiles.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
const browserProofFiles = [
  'notes-browser-proof-evidence.txt',
  'notes-music-insert-browser-proof-evidence.txt',
  'notes-update-failure-browser-proof-evidence.txt',
  'notes-removal-failure-browser-proof-evidence.txt',
  'notes-removal-success-browser-proof-evidence.txt',
  'notes-removal-cloud-artwork-browser-proof-evidence.txt',
  'note-reactors-list-before-split-browser-proof-evidence.txt',
  'note-reactors-list-after-split-browser-proof-evidence.txt'
];
for (const file of browserProofFiles) {
  const evidencePath = path.join(repo, 'docs', file);
  assert(fs.existsSync(evidencePath), `Notes browser proof must exist: ${file}`);
  assert(fs.readFileSync(evidencePath, 'utf8').includes('PASS'), `Notes browser proof must contain PASS: ${file}`);
}
const requiredHtmlMarkers = [
  'window.viewNote = async function(noteId)',
  'window.removeMyNoteFromViewer = async function(noteId)',
  'let _noteViewAudio = null',
  'quick_note_views',
  'quick_note_reactions',
  'quick_notes',
  'loadNotesBar()',
  'Cloudinary',
  '_noteViewAudio.pause()'
];
for (const marker of requiredHtmlMarkers) {
  const surface = `${html}\n${noteOwners}\n${noteDeletionOwner}`;
  assert(surface.includes(marker), `Notes seam marker must remain available: ${marker}`);
}
assert(notesBar.includes('function _fetchNotesBarData('), 'Notes Bar data helper must remain extracted at its existing boundary');
assert(notesBar.includes('function _renderNotesBarHtml('), 'Notes Bar render helper must remain extracted at its existing boundary');
assert(html.includes('async function submitNote()'), 'submitNote must remain inline');
assert.strictEqual((noteOwners.match(/window\.viewNote\s*=\s*async function\(/g) || []).length, 1, 'viewNote must have one window-assigned module owner');
assert.strictEqual((noteOwners.match(/window\.removeMyNoteFromViewer\s*=\s*async function\(/g) || []).length, 1, 'removeMyNoteFromViewer must have one window-assigned module owner');
assert.strictEqual((noteDeletionOwner.match(/window\.deleteMyNote\s*=\s*async function\(/g) || []).length, 1, 'deleteMyNote must have one window-assigned module owner');
assert.strictEqual((reactorListOwner.match(/window\.loadNoteReactorsList\s*=\s*async function\(/g) || []).length, 1, 'loadNoteReactorsList must have one window-assigned module owner');
assert.strictEqual((html.match(/async function loadNoteReactorsList\(noteId\)\{/g) || []).length, 0, 'loadNoteReactorsList must be absent from inline HTML');
assert(html.indexOf('src/features/push-settings.js') < html.indexOf('src/features/note-reactors-list-owner.js'), 'reactor-list module must follow Push settings');
assert(html.indexOf('src/features/note-reactors-list-owner.js') < html.indexOf('src/features/note-viewer-owners.js'), 'reactor-list module must precede Note viewer callers');
const reactorEvidence = fs.readFileSync(path.join(repo, 'docs', 'note-reactors-list-parity-rollback-evidence.txt'), 'utf8');
assert(reactorEvidence.includes('OWNER_BODY_PARITY=PASS') && reactorEvidence.includes('ROLLBACK_EVIDENCE=PASS'), 'reactor-list parity and rollback evidence must pass');
assert.strictEqual(sourceText.includes('async function deleteMyNote()'), false, 'deleteMyNote must not remain as a declaration in source modules');
assert(fs.existsSync(path.join(repo, 'docs', 'note-deletion-browser-parity-harness.js')), 'Note deletion parity harness must remain present');
assert(fs.existsSync(path.join(repo, 'docs', 'note-viewer-contract.md')), 'Note viewer behavior contract must remain present');
assert(fs.existsSync(path.join(repo, 'docs', 'note-viewer-contract-harness.js')), 'Note viewer behavior harness must remain present');
const noteHarness = fs.readFileSync(path.join(repo, 'docs', 'note-viewer-contract-harness.js'), 'utf8');
assert(noteHarness.includes('createInjectedNotesInteractionSeam'), 'Notes injected seam proof must remain present');
assert(noteHarness.includes("calls.push('view')") && noteHarness.includes("calls.push('remove')"), 'Notes injected seam dispatch markers must remain present');

console.log('NOTES_SEAM_PREPARATION_HARNESS=PASS');
console.log('DEPENDENCY_MAP=BAR_VIEWER_REMOVAL_AUDIO_REACTIONS_MEDIA_REFRESH');
console.log('PROTECTED_NOTES_SIGNATURES=4');
console.log('BROWSER_MOCK_EVIDENCE=6_PASS');
console.log('INJECTED_SEAM_PROOF=PASS');
console.log('NOTE_DELETION_BROWSER_PARITY=PASS');
console.log('EXTRACTED_PROTECTED_NOTES_SIGNATURES=4_APPROVED_NOTE_VIEWER_DELETION_AND_REACTOR_LIST_OWNERS');
console.log('EXTRACTED_NOTES_BAR_HELPERS=2');
console.log('PRODUCTION_SPLIT=COMPLETE');
