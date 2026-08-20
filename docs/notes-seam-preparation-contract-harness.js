const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const repo = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const notesBar = fs.readFileSync(path.join(repo, 'src', 'features', 'notes-bar.js'), 'utf8');
const sourceFiles = execFileSync('find', [path.join(repo, 'src'), '-type', 'f', '-name', '*.js'], { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
const sourceText = sourceFiles.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
const requiredHtmlMarkers = [
  'async function viewNote(noteId)',
  'async function removeMyNoteFromViewer(noteId)',
  'async function deleteMyNote()',
  'let _noteViewAudio = null',
  'quick_note_views',
  'quick_note_reactions',
  'quick_notes',
  'loadNotesBar()',
  'Cloudinary',
  '_noteViewAudio.pause()'
];
for (const marker of requiredHtmlMarkers) {
  assert(html.includes(marker), `Notes seam marker must remain inline: ${marker}`);
}
assert(notesBar.includes('function _fetchNotesBarData('), 'Notes Bar data helper must remain extracted at its existing boundary');
assert(notesBar.includes('function _renderNotesBarHtml('), 'Notes Bar render helper must remain extracted at its existing boundary');
assert(html.includes('async function submitNote()'), 'submitNote must remain inline');
assert.strictEqual(sourceText.includes('async function viewNote(noteId)'), false, 'viewNote must not be extracted');
assert.strictEqual(sourceText.includes('async function removeMyNoteFromViewer(noteId)'), false, 'removeMyNoteFromViewer must not be extracted');
assert.strictEqual(sourceText.includes('async function deleteMyNote()'), false, 'deleteMyNote must not be extracted');
assert(fs.existsSync(path.join(repo, 'docs', 'note-viewer-contract.md')), 'Note viewer behavior contract must remain present');
assert(fs.existsSync(path.join(repo, 'docs', 'note-viewer-contract-harness.js')), 'Note viewer behavior harness must remain present');

console.log('NOTES_SEAM_PREPARATION_HARNESS=PASS');
console.log('DEPENDENCY_MAP=BAR_VIEWER_REMOVAL_AUDIO_REACTIONS_MEDIA_REFRESH');
console.log('PROTECTED_NOTES_SIGNATURES=4');
console.log('EXTRACTED_PROTECTED_NOTES_SIGNATURES=0');
console.log('EXTRACTED_NOTES_BAR_HELPERS=2');
console.log('PRODUCTION_SPLIT=0');
