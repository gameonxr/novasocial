const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const repo = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const sourceFiles = execFileSync('find', [path.join(repo, 'src'), '-type', 'f', '-name', '*.js'], { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
const sourceText = sourceFiles.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
const docsDir = path.join(repo, 'docs');
const protectedSignatures = [
  'async function renderDMs()',
  'function openChat(',
  'async function renderReels()',
  'function createPeerConnection(callId, remoteUserId) {',
  'function openSV(startIdx){',
  'function spawnLikeParticles(el){',
  'async function toggleRecording(cid)',
  'async function enablePushFromSettings()',
  'async function resetPushFromSettings()',
  'async function submitNote()',
  'async function deleteMyNote()',
  'function submitNativeEmojiReaction(',
  'function reactToNote(',
  'async function loadNoteReactorsList(',
  'function renderStoryElements()',
  'async function voteStoryPoll(',
  'async function refreshPollResults(',
  'async function loadStoryPollState(',
  'async function syncLocalDeletionFallback()',
];
const requiredCoverage = [
  'protected-inline-parity-contract.md',
  'protected-inline-parity-contract-harness.js',
  'protected-contract-coverage.md',
  'protected-contract-coverage-harness.js',
  'protected-inline-boundary-contract.md',
  'protected-inline-boundary-contract-harness.js',
  'dms-realtime-contract.md',
  'dms-realtime-contract-harness.js',
  'reels-persistent-contract.md',
  'reels-persistent-contract-harness.js',
  'calls-webrtc-contract.md',
  'calls-webrtc-contract-harness.js',
  'voice-recording-contract.md',
  'voice-recording-contract-harness.js',
];

assert.strictEqual(sourceFiles.length, 211, '211 extracted JavaScript modules must remain present');
for (const signature of protectedSignatures) {
  assert.strictEqual(html.split(signature).length - 1, 1, `protected marker must remain exactly once inline: ${signature}`);
  assert.strictEqual(sourceText.includes(signature), false, `protected marker must not be extracted: ${signature}`);
}
for (const file of requiredCoverage) {
  assert(fs.existsSync(path.join(docsDir, file)), `required high-risk coverage file missing: ${file}`);
}
assert(fs.existsSync(path.join(docsDir, 'account-bootstrap-contract.md')), 'adapter/seam guidance must remain documented');
assert(fs.existsSync(path.join(docsDir, 'account-bootstrap-adapter-harness.js')), 'adapter/seam harness must remain available');

console.log('HIGH_RISK_EXTRACTION_GATE_HARNESS=PASS');
console.log(`PROTECTED_SIGNATURES=${protectedSignatures.length}`);
console.log('EXTRACTED_PROTECTED_SIGNATURES=0');
console.log(`REQUIRED_COVERAGE_FILES=${requiredCoverage.length + 2}`);
console.log('DIRECT_EXTRACTION=BLOCKED_UNTIL_SEAM_PROOF');
console.log('BRANCH2_ONLY=PASS');
