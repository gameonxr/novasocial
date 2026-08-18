'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = '/home/ubuntu/novasocial';
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

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
  assert(html.includes(marker), `protected marker missing: ${marker}`);
}

const scriptMarkers = [
  '<script src="src/features/smart-ranking.js"></script>',
  '<script src="src/features/nova-init.js"></script>',
  '<script src="src/features/like-effects.js"></script>'
];
const positions = scriptMarkers.map(marker => html.indexOf(marker));
assert(positions.every(position => position >= 0), 'required trailing scripts must remain present');
assert(positions[0] < positions[1] && positions[1] < positions[2], 'trailing script order must remain smart-ranking, nova-init, like-effects');

const sourceFiles = fs.readdirSync(path.join(repo, 'docs')).filter(name => name.endsWith('-contract.md') || name.endsWith('-contract-harness.js'));
assert(sourceFiles.length >= 70, `expected published contract documentation set, found ${sourceFiles.length} files`);

console.log('PROTECTED_INLINE_BOUNDARY_HARNESS=PASS');
console.log(`PROTECTED_MARKERS=${protectedMarkers.length}`);
console.log(`CONTRACT_DOC_FILES=${sourceFiles.length}`);
