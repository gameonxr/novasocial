'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = '/home/ubuntu/novasocial';
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const docs = path.join(repo, 'docs');
const particleModule = fs.readFileSync(path.join(repo, 'src', 'features', 'spawn-like-particles.js'), 'utf8');
const pushModule = fs.readFileSync(path.join(repo, 'src', 'features', 'push-settings.js'), 'utf8');
const noteModule = fs.readFileSync(path.join(repo, 'src', 'features', 'note-viewer-owners.js'), 'utf8');
const noteDeletionModule = fs.readFileSync(path.join(repo, 'src', 'features', 'note-deletion-owner.js'), 'utf8');
const storyModule = fs.readFileSync(path.join(repo, 'src', 'features', 'story-editor-owners.js'), 'utf8');
const reactorListModule = fs.readFileSync(path.join(repo, 'src', 'features', 'note-reactors-list-owner.js'), 'utf8');

const coverage = [
  ['function maybeShowPushPermissionBanner()', 'push-permission-contract'],
  ['function silentPushResubscribeIfGranted()', 'push-permission-contract'],
  ['function renderStoryElements()', 'story-editor-contract'],
  ['function openSV(', 'story-viewer-contract'],
  ['async function renderReels()', 'reels-persistent-contract'],
  ['async function renderDMs()', 'dms-realtime-contract'],
  ['async function voteStoryPoll(', 'story-poll-contract'],
  ['async function refreshPollResults(', 'story-poll-contract'],
  ['async function loadStoryPollState(', 'story-poll-contract'],
  ['async function toggleRecording(', 'voice-recording-contract'],
  ['async function enablePushFromSettings()', 'push-permission-contract'],
  ['async function resetPushFromSettings()', 'push-permission-contract'],
  ['function spawnLikeParticles(', 'spawn-like-particles-contract'],
  ['function createPeerConnection(', 'calls-webrtc-contract'],
  ['async function submitNote()', 'note-viewer-contract'],
  ['async function deleteMyNote()', 'note-viewer-contract'],
  ['function reactToNote(', 'note-viewer-contract'],
  ['async function loadNoteReactorsList(', 'note-reactors-list-production-split-contract'],
  ['function submitNativeEmojiReaction(', 'note-viewer-contract']
];

for (const [marker, base] of coverage) {
  if (marker === 'function spawnLikeParticles(') {
    assert(particleModule.includes('window.spawnLikeParticles = function(el){'), 'approved particle production owner missing from src');
    assert(!html.includes(marker), 'approved particle owner must be absent from inline HTML');
  } else if (marker === 'async function enablePushFromSettings()' || marker === 'async function resetPushFromSettings()') {
    assert(!html.includes(marker), `approved Push owner must be absent from inline HTML: ${marker}`);
    const ownerName = marker.includes('enablePushFromSettings') ? 'enablePushFromSettings' : 'resetPushFromSettings';
    assert(pushModule.includes(`window.${ownerName} = async function(`), `approved Push owner missing from src: ${marker}`);
  } else if (marker === 'function renderStoryElements()') {
    assert(!html.includes(marker), 'approved Story renderer must be absent from inline HTML');
    assert.strictEqual((storyModule.match(/window\.renderStoryElements\s*=\s*function\(\)\{/g) || []).length, 1, 'approved Story renderer must have one owner');
  } else if (marker === 'async function deleteMyNote()') {
    assert(!html.includes(marker), 'approved Note deletion owner must be absent from inline HTML');
    assert.strictEqual((noteDeletionModule.match(/window\.deleteMyNote\s*=\s*async function\(/g) || []).length, 1, 'approved Note deletion owner must have one owner');
  } else if (marker === 'async function loadNoteReactorsList(') {
    assert(!html.includes(marker), 'approved Notes reactor-list owner must be absent from inline HTML');
    assert.strictEqual((reactorListModule.match(/window\.loadNoteReactorsList\s*=\s*async function\(/g) || []).length, 1, 'approved Notes reactor-list owner must have one owner');
  } else {
    assert(html.includes(marker), `protected production marker missing: ${marker}`);
  }
  assert(fs.existsSync(path.join(docs, `${base}.md`)), `contract missing for ${marker}: ${base}.md`);
  assert(fs.existsSync(path.join(docs, `${base}-harness.js`)), `harness missing for ${marker}: ${base}-harness.js`);
}

const trailing = [
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
].map(marker => html.indexOf(marker));
assert(trailing.every(position => position >= 0), 'required trailing scripts are present');
assert(trailing.every((position, index) => index === 0 || trailing[index - 1] < position), 'required trailing script order is preserved');
assert.strictEqual((noteModule.match(/window\.(?:viewNote|removeMyNoteFromViewer)\s*=\s*async function\(/g) || []).length, 2, 'approved Note viewer owners must be present exactly twice');

console.log('PROTECTED_CONTRACT_COVERAGE_HARNESS=PASS');
console.log(`PROTECTED_SEAMS=${coverage.length}`);
console.log('APPROVED_WINDOW_OWNERS=9_PARTICLE_DELETION_PUSH_NOTE_DELETION_STORY_AND_REACTOR_LIST');
