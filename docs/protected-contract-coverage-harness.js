'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = '/home/ubuntu/novasocial';
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const docs = path.join(repo, 'docs');

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
  ['async function loadNoteReactorsList(', 'note-viewer-contract'],
  ['function submitNativeEmojiReaction(', 'note-viewer-contract']
];

for (const [marker, base] of coverage) {
  assert(html.includes(marker), `protected production marker missing: ${marker}`);
  assert(fs.existsSync(path.join(docs, `${base}.md`)), `contract missing for ${marker}: ${base}.md`);
  assert(fs.existsSync(path.join(docs, `${base}-harness.js`)), `harness missing for ${marker}: ${base}-harness.js`);
}

const trailing = [
  '<script src="src/features/smart-ranking.js"></script>',
  '<script src="src/features/nova-init.js"></script>',
  '<script src="src/features/like-effects.js"></script>'
].map(marker => html.indexOf(marker));
assert(trailing.every(position => position >= 0), 'required trailing scripts are present');
assert(trailing[0] < trailing[1] && trailing[1] < trailing[2], 'required trailing script order is preserved');

console.log('PROTECTED_CONTRACT_COVERAGE_HARNESS=PASS');
console.log(`PROTECTED_SEAMS=${coverage.length}`);
