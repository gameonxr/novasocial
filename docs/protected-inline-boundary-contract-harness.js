'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = '/home/ubuntu/novasocial';
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const particleModule = fs.readFileSync(path.join(repo, 'src', 'features', 'spawn-like-particles.js'), 'utf8');
const pushModule = fs.readFileSync(path.join(repo, 'src', 'features', 'push-settings.js'), 'utf8');
const storyModule = fs.readFileSync(path.join(repo, 'src', 'features', 'story-editor-owners.js'), 'utf8');
const noteViewerModule = fs.readFileSync(path.join(repo, 'src', 'features', 'note-viewer-owners.js'), 'utf8');
const noteDeletionModule = fs.readFileSync(path.join(repo, 'src', 'features', 'note-deletion-owner.js'), 'utf8');
const reactorListModule = fs.readFileSync(path.join(repo, 'src', 'features', 'note-reactors-list-owner.js'), 'utf8');
const notesReactionModule = fs.readFileSync(path.join(repo, 'src', 'features', 'notes-reaction-owner.js'), 'utf8');
const dmsModule = fs.readFileSync(path.join(repo, 'src', 'features', 'dms-renderer-owner.js'), 'utf8');
const reelsModule = fs.readFileSync(path.join(repo, 'src', 'features', 'reels-renderer-owner.js'), 'utf8');

const protectedMarkers = [
  'function maybeShowPushPermissionBanner()',
  'function silentPushResubscribeIfGranted()',
  'function renderStoryElements()',
  'function openSV(',
  'async function renderReels()',
  'async function renderDMs()',
  'async function voteStoryPoll(',
  'async function refreshPollResults(',
  'async function loadStoryPollState(',
  'async function toggleRecording(',
  'async function enablePushFromSettings()',
  'async function resetPushFromSettings()',
  'function spawnLikeParticles(',
  'function createPeerConnection(',
  'async function submitNote()',
  'async function deleteMyNote()',
  'function reactToNote(',
  'async function loadNoteReactorsList(',
  'function submitNativeEmojiReaction('
];

for (const marker of protectedMarkers) {
  if (marker === 'function spawnLikeParticles(') {
    assert(!html.includes(marker), 'approved particle marker must be absent from inline HTML');
    assert(particleModule.includes('window.spawnLikeParticles = function(el){'), 'approved particle module owner must be present');
  } else if (marker === 'async function enablePushFromSettings()' || marker === 'async function resetPushFromSettings()') {
    const ownerName = marker.includes('enablePushFromSettings') ? 'enablePushFromSettings' : 'resetPushFromSettings';
    assert(!html.includes(marker), `approved Push marker must be absent from inline HTML: ${marker}`);
    assert(pushModule.includes(`window.${ownerName} = async function(`), `approved Push module owner must be present: ${marker}`);
  } else if (marker === 'async function renderReels()') {
    assert(!html.includes(marker), 'approved Reels renderer marker must be absent from inline HTML');
    assert.strictEqual((reelsModule.match(/window\.renderReels\s*=\s*async function\(\)\{/g) || []).length, 1, 'approved Reels module owner must be present exactly once');
  } else if (marker === 'async function renderDMs()') {
    assert(!html.includes(marker), 'approved DMs marker must be absent from inline HTML');
    assert.strictEqual((dmsModule.match(/window\.renderDMs\s*=\s*async function\(\)\{/g) || []).length, 1, 'approved DMs module owner must be present exactly once');
  } else if (marker === 'function renderStoryElements()') {
    assert(!html.includes(marker), 'approved Story marker must be absent from inline HTML');
    assert.strictEqual((storyModule.match(/window\.renderStoryElements\s*=\s*function\(\)\{/g) || []).length, 1, 'approved Story module owner must be present exactly once');
  } else if (marker === 'async function viewNote(' || marker === 'function removeMyNoteFromViewer(') {
    const ownerName = marker.includes('viewNote') ? 'viewNote' : 'removeMyNoteFromViewer';
    assert(!html.includes(marker), `approved Note viewer marker must be absent from inline HTML: ${marker}`);
    assert(noteViewerModule.includes(`window.${ownerName} = async function(`), `approved Note viewer module owner must be present: ${marker}`);
  } else if (marker === 'async function deleteMyNote()') {
    assert(!html.includes(marker), 'approved Note deletion marker must be absent from inline HTML');
    assert(noteDeletionModule.includes('window.deleteMyNote = async function(){'), 'approved Note deletion module owner must be present');
  } else if (marker === 'async function loadNoteReactorsList(') {
    assert(!html.includes(marker), 'approved Notes reactor-list marker must be absent from inline HTML');
    assert(reactorListModule.includes('window.loadNoteReactorsList = async function('), 'approved Notes reactor-list module owner must be present');
  } else if (marker === 'function reactToNote(') {
    assert(!html.includes(marker), 'approved Notes reaction marker must be absent from inline HTML');
    assert(notesReactionModule.includes('window.reactToNote = function reactToNote('), 'approved Notes reaction module owner must be present');
  } else {
    assert(html.includes(marker), `protected marker missing: ${marker}`);
  }
}

const scriptMarkers = [
  '<script src="src/features/smart-ranking.js"></script>',
  '<script src="src/features/nova-init.js"></script>',
  '<script src="src/features/spawn-like-particles.js"></script>',
  '<script src="src/features/sync-local-deletion-fallback.js"></script>',
  '<script src="src/features/push-settings.js"></script>',
  '<script src="src/features/note-reactors-list-owner.js"></script>',
  '<script src="src/features/note-viewer-owners.js"></script>',
  '<script src="src/features/note-deletion-owner.js"></script>',
  '<script src="src/features/story-editor-owners.js"></script>',
  '<script src="src/features/like-effects.js"></script>'
];
const positions = scriptMarkers.map(marker => html.indexOf(marker));
assert(positions.every(position => position >= 0), 'required trailing scripts must remain present');
assert(positions.every((position, index) => index === 0 || positions[index - 1] < position), 'trailing script order must remain unchanged');

const sourceFiles = fs.readdirSync(path.join(repo, 'docs')).filter(name => name.endsWith('-contract.md') || name.endsWith('-contract-harness.js'));
assert(sourceFiles.length >= 70, `expected published contract documentation set, found ${sourceFiles.length} files`);

console.log('PROTECTED_INLINE_BOUNDARY_HARNESS=PASS');
console.log(`PROTECTED_MARKERS=${protectedMarkers.length}`);
console.log(`CONTRACT_DOC_FILES=${sourceFiles.length}`);
