const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const repo = path.resolve(__dirname, '..');
const docsDir = path.join(repo, 'docs');
const matrix = fs.readFileSync(path.join(docsDir, 'high-risk-seam-readiness-matrix-contract.md'), 'utf8');
const gate = fs.readFileSync(path.join(docsDir, 'high-risk-extraction-gate-contract.md'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const sourceFiles = execFileSync('find', [path.join(repo, 'src'), '-type', 'f', '-name', '*.js'], { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
const source = sourceFiles.map(file => fs.readFileSync(file, 'utf8')).join('\n');

assert(matrix.includes('Reversible browser proof | Contract and harness are present; browser proof is not yet established for a protected split'), 'matrix must continue to mark browser proof as remaining');
assert(matrix.includes('Protected production splits | 0/19 signatures moved'), 'matrix must continue to report zero protected production splits');
assert(gate.includes('Direct extraction is explicitly blocked until adapter and proof work passes'), 'direct extraction gate must remain blocked');

for (const file of [
  'dms-seam-preparation-contract.md',
  'reels-seam-preparation-contract.md',
  'calls-webrtc-seam-preparation-contract.md',
  'stories-seam-preparation-contract.md',
  'notes-seam-preparation-contract.md',
  'voice-recording-seam-preparation-contract.md',
  'deletion-fallback-seam-preparation-contract.md',
  'particle-seam-preparation-contract.md',
  'push-seam-preparation-contract.md',
  'reversible-browser-proof-contract.md'
]) {
  assert(fs.existsSync(path.join(docsDir, file)), `required seam/proof contract missing: ${file}`);
}
for (const file of [
  'dms-seam-preparation-contract-harness.js',
  'reels-seam-preparation-contract-harness.js',
  'calls-webrtc-seam-preparation-contract-harness.js',
  'stories-seam-preparation-contract-harness.js',
  'notes-seam-preparation-contract-harness.js',
  'voice-recording-seam-preparation-contract-harness.js',
  'deletion-fallback-seam-preparation-contract-harness.js',
  'particle-seam-preparation-contract-harness.js',
  'push-seam-preparation-contract-harness.js',
  'reversible-browser-proof-contract-harness.js'
]) {
  assert(fs.existsSync(path.join(docsDir, file)), `required seam/proof harness missing: ${file}`);
}

assert(fs.existsSync(path.join(docsDir, 'particle-browser-proof-evidence.txt')), 'particle browser-proof evidence must remain present');
assert(fs.readFileSync(path.join(docsDir, 'particle-browser-proof-evidence.txt'), 'utf8').includes('NON_DESTRUCTIVE_PARTICLE_BROWSER_MOCK=PASS'), 'particle browser mock evidence must remain PASS');
assert(fs.existsSync(path.join(docsDir, 'particle-parity-rollback-evidence.txt')), 'particle parity and rollback evidence must remain present');
assert(fs.readFileSync(path.join(docsDir, 'particle-parity-rollback-evidence.txt'), 'utf8').includes('Parity result: PASS'), 'particle parity evidence must remain PASS');
assert(fs.readFileSync(path.join(docsDir, 'particle-parity-rollback-evidence.txt'), 'utf8').includes('Rollback result: PASS'), 'particle rollback evidence must remain PASS');
assert(fs.existsSync(path.join(docsDir, 'voice-browser-proof-evidence.txt')), 'voice browser-proof evidence must remain present');
assert(fs.readFileSync(path.join(docsDir, 'voice-browser-proof-evidence.txt'), 'utf8').includes('NON_DESTRUCTIVE_VOICE_PERMISSION_DENIED_BROWSER_MOCK=PASS'), 'voice permission-denied browser evidence must remain PASS');
assert(fs.existsSync(path.join(docsDir, 'recording-start-stop-browser-proof-evidence.txt')), 'recording start-stop browser-proof evidence must remain present');
assert(fs.readFileSync(path.join(docsDir, 'recording-start-stop-browser-proof-evidence.txt'), 'utf8').includes('NON_DESTRUCTIVE_RECORDING_START_STOP_BROWSER_MOCK=PASS'), 'recording start-stop browser evidence must remain PASS');
assert(fs.existsSync(path.join(docsDir, 'dms-empty-state-browser-proof-evidence.txt')), 'DMs empty-state browser-proof evidence must remain present');
assert(fs.readFileSync(path.join(docsDir, 'dms-empty-state-browser-proof-evidence.txt'), 'utf8').includes('NON_DESTRUCTIVE_DMS_EMPTY_STATE_BROWSER_MOCK=PASS'), 'DMs empty-state browser evidence must remain PASS');
assert(fs.existsSync(path.join(docsDir, 'reels-empty-state-browser-proof-evidence.txt')), 'Reels empty-state browser-proof evidence must remain present');
assert(fs.readFileSync(path.join(docsDir, 'reels-empty-state-browser-proof-evidence.txt'), 'utf8').includes('NON_DESTRUCTIVE_REELS_EMPTY_STATE_BROWSER_MOCK=PASS'), 'Reels empty-state browser evidence must remain PASS');
assert(fs.existsSync(path.join(docsDir, 'push-browser-proof-evidence.txt')), 'Push browser-proof evidence must remain present');
assert(fs.readFileSync(path.join(docsDir, 'push-browser-proof-evidence.txt'), 'utf8').includes('NON_DESTRUCTIVE_PUSH_UNSUPPORTED_BROWSER_MOCK=PASS'), 'Push unsupported-capability browser evidence must remain PASS');
assert(fs.existsSync(path.join(docsDir, 'push-denied-browser-proof-evidence.txt')), 'Push denied browser-proof evidence must remain present');
assert(fs.readFileSync(path.join(docsDir, 'push-denied-browser-proof-evidence.txt'), 'utf8').includes('NON_DESTRUCTIVE_PUSH_DENIED_BROWSER_MOCK=PASS'), 'Push denied-permission browser evidence must remain PASS');
assert(fs.existsSync(path.join(docsDir, 'push-granted-browser-proof-evidence.txt')), 'Push granted browser-proof evidence must remain present');
assert(fs.readFileSync(path.join(docsDir, 'push-granted-browser-proof-evidence.txt'), 'utf8').includes('NON_DESTRUCTIVE_PUSH_GRANTED_DELEGATION_BROWSER_MOCK=PASS'), 'Push granted/resubscribe browser evidence must remain PASS');
assert(fs.existsSync(path.join(docsDir, 'push-default-denied-browser-proof-evidence.txt')), 'Push default-denied browser-proof evidence must remain present');
assert(fs.readFileSync(path.join(docsDir, 'push-default-denied-browser-proof-evidence.txt'), 'utf8').includes('NON_DESTRUCTIVE_PUSH_DEFAULT_DENIED_BROWSER_MOCK=PASS'), 'Push default-denied browser evidence must remain PASS');
assert(fs.existsSync(path.join(docsDir, 'push-default-granted-browser-proof-evidence.txt')), 'Push default-granted browser-proof evidence must remain present');
assert(fs.readFileSync(path.join(docsDir, 'push-default-granted-browser-proof-evidence.txt'), 'utf8').includes('NON_DESTRUCTIVE_PUSH_DEFAULT_GRANTED_BROWSER_MOCK=PASS'), 'Push default-granted browser evidence must remain PASS');
assert(fs.existsSync(path.join(docsDir, 'push-default-dismissed-browser-proof-evidence.txt')), 'Push default-dismissed browser-proof evidence must remain present');
assert(fs.readFileSync(path.join(docsDir, 'push-default-dismissed-browser-proof-evidence.txt'), 'utf8').includes('NON_DESTRUCTIVE_PUSH_DEFAULT_DISMISSED_BROWSER_MOCK=PASS'), 'Push default-dismissed browser evidence must remain PASS');
assert(fs.existsSync(path.join(docsDir, 'push-request-failure-browser-proof-evidence.txt')), 'Push request-failure browser-proof evidence must remain present');
assert(fs.readFileSync(path.join(docsDir, 'push-request-failure-browser-proof-evidence.txt'), 'utf8').includes('NON_DESTRUCTIVE_PUSH_REQUEST_FAILURE_BROWSER_MOCK=PASS'), 'Push request-failure browser evidence must remain PASS');
assert(fs.existsSync(path.join(docsDir, 'push-reset-failure-browser-proof-evidence.txt')), 'Push reset-failure browser-proof evidence must remain present');
assert(fs.readFileSync(path.join(docsDir, 'push-reset-failure-browser-proof-evidence.txt'), 'utf8').includes('NON_DESTRUCTIVE_PUSH_RESET_FAILURE_BROWSER_MOCK=PASS'), 'Push reset-failure browser evidence must remain PASS');
assert(fs.existsSync(path.join(docsDir, 'push-reset-success-browser-proof-evidence.txt')), 'Push reset-success browser-proof evidence must remain present');
assert(fs.readFileSync(path.join(docsDir, 'push-reset-success-browser-proof-evidence.txt'), 'utf8').includes('NON_DESTRUCTIVE_PUSH_RESET_SUCCESS_BROWSER_MOCK=PASS'), 'Push reset-success browser evidence must remain PASS');
assert(fs.existsSync(path.join(docsDir, 'notes-browser-proof-evidence.txt')), 'Notes browser-proof evidence must remain present');
assert(fs.readFileSync(path.join(docsDir, 'notes-browser-proof-evidence.txt'), 'utf8').includes('NON_DESTRUCTIVE_NOTES_EMPTY_VALIDATION_BROWSER_MOCK=PASS'), 'Notes empty-validation browser evidence must remain PASS');
assert(fs.existsSync(path.join(docsDir, 'notes-music-insert-browser-proof-evidence.txt')), 'Notes music-insert browser-proof evidence must remain present');
assert(fs.readFileSync(path.join(docsDir, 'notes-music-insert-browser-proof-evidence.txt'), 'utf8').includes('NON_DESTRUCTIVE_NOTES_MUSIC_INSERT_BROWSER_MOCK=PASS'), 'Notes music-insert browser evidence must remain PASS');
assert(fs.existsSync(path.join(docsDir, 'notes-update-failure-browser-proof-evidence.txt')), 'Notes update-failure browser-proof evidence must remain present');
assert(fs.readFileSync(path.join(docsDir, 'notes-update-failure-browser-proof-evidence.txt'), 'utf8').includes('NON_DESTRUCTIVE_NOTES_UPDATE_FAILURE_BROWSER_MOCK=PASS'), 'Notes update-failure browser evidence must remain PASS');
assert(fs.existsSync(path.join(docsDir, 'deletion-fallback-browser-proof-evidence.txt')), 'deletion-fallback browser-proof evidence must remain present');
assert(fs.readFileSync(path.join(docsDir, 'deletion-fallback-browser-proof-evidence.txt'), 'utf8').includes('NON_DESTRUCTIVE_DELETION_FALLBACK_ERROR_BROWSER_MOCK=PASS'), 'deletion-fallback browser evidence must remain PASS');
assert(fs.existsSync(path.join(docsDir, 'deletion-fallback-valid-queue-browser-proof-evidence.txt')), 'deletion-fallback valid-queue browser-proof evidence must remain present');
assert(fs.readFileSync(path.join(docsDir, 'deletion-fallback-valid-queue-browser-proof-evidence.txt'), 'utf8').includes('NON_DESTRUCTIVE_DELETION_FALLBACK_VALID_QUEUE_BROWSER_MOCK=PASS'), 'deletion-fallback valid-queue browser evidence must remain PASS');
assert(fs.existsSync(path.join(docsDir, 'deletion-fallback-empty-queue-browser-proof-evidence.txt')), 'deletion-fallback empty-queue browser-proof evidence must remain present');
assert(fs.readFileSync(path.join(docsDir, 'deletion-fallback-empty-queue-browser-proof-evidence.txt'), 'utf8').includes('NON_DESTRUCTIVE_DELETION_FALLBACK_EMPTY_QUEUE_BROWSER_MOCK=PASS'), 'deletion-fallback empty-queue browser evidence must remain PASS');

for (const signature of [
  'async function renderDMs()',
  'async function renderReels()',
  'function createPeerConnection(callId, remoteUserId) {',
  'function openSV(startIdx){',
  'function spawnLikeParticles(el){',
  'async function toggleRecording(cid)',
  'async function enablePushFromSettings()',
  'async function resetPushFromSettings()',
  'async function submitNote()',
  'async function deleteMyNote()',
  'function renderStoryElements()',
  'async function syncLocalDeletionFallback()'
]) {
  assert.strictEqual((html.match(new RegExp(signature.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length, 1, `protected owner must remain exactly once inline: ${signature}`);
  assert(!source.includes(signature), `protected owner must remain outside src: ${signature}`);
}

assert(!source.includes('reversibleBrowserProofPassed'), 'no speculative browser-proof pass flag may be introduced');
assert(!source.includes('productionSplitApproved'), 'no speculative production-split approval flag may be introduced');

console.log('REVERSIBLE_BROWSER_PROOF_CONTRACT_HARNESS=PASS');
console.log('PROOF_STATUS=REMAINING');
console.log('PROTECTED_SPLITS=0_OF_19');
console.log('DIRECT_EXTRACTION=BLOCKED_UNTIL_SEAM_PROOF');
console.log('PRODUCTION_CHANGE=0');
