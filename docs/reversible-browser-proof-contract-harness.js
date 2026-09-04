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

assert(matrix.includes('fresh Notes reaction deployment observation') && matrix.includes('0 unapproved systems'), 'matrix must continue to mark remaining browser proof');
assert(matrix.includes('all twenty-two protected seam contracts explicitly bind their corresponding evidence inventories'), 'matrix must preserve repository-wide seam inventory alignment');
assert(matrix.includes('Protected production splits | 22/22 protected signatures moved; all bounded scopes are split-complete, including the final-stretch Calls/WebRTC, Story viewer, voice recording, chat/DMs, media upload, tab caching, and auth-helper owners, plus the nova-ultra-patches region; authenticated reaction invocation remains intentionally unperformed'), 'matrix must report the completed protected-signature extraction and supporting Reels helper');
assert(gate.includes('Direct extraction remains explicitly blocked for the inline boundary surfaces'), 'direct extraction gate must remain blocked for the remaining inline boundary surfaces');

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
assert(fs.existsSync(path.join(docsDir, 'particle-browser-comparison-proof-evidence.txt')), 'particle comparison browser-proof evidence must remain present');
assert(fs.readFileSync(path.join(docsDir, 'particle-browser-comparison-proof-evidence.txt'), 'utf8').includes('RESULT=PASS'), 'particle comparison browser evidence must remain PASS');
assert(fs.existsSync(path.join(docsDir, 'particle-after-split-browser-proof-evidence.txt')), 'particle after-split browser-proof evidence must remain present');
assert(fs.readFileSync(path.join(docsDir, 'particle-after-split-browser-proof-evidence.txt'), 'utf8').includes('PRODUCTION_PARTICLE_SMOKE=PASS'), 'particle after-split browser evidence must remain PASS');
assert(fs.readFileSync(path.join(docsDir, 'particle-browser-proof-evidence.txt'), 'utf8').includes('NON_DESTRUCTIVE_PARTICLE_BROWSER_MOCK=PASS'), 'particle browser mock evidence must remain PASS');
assert(fs.existsSync(path.join(docsDir, 'particle-parity-rollback-evidence.txt')), 'particle parity and rollback evidence must remain present');
assert(fs.readFileSync(path.join(docsDir, 'particle-parity-rollback-evidence.txt'), 'utf8').includes('After-split parity result: PASS'), 'particle after-split parity evidence must remain PASS');
assert(fs.readFileSync(path.join(docsDir, 'particle-parity-rollback-evidence.txt'), 'utf8').includes('Rollback result: PASS'), 'particle rollback evidence must remain PASS');
assert(fs.existsSync(path.join(docsDir, 'deletion-fallback-browser-comparison-proof-evidence.txt')), 'deletion-fallback comparison browser-proof evidence must remain present');
assert(fs.readFileSync(path.join(docsDir, 'deletion-fallback-browser-comparison-proof-evidence.txt'), 'utf8').includes('RESULT=PASS'), 'deletion-fallback comparison browser evidence must remain PASS');
assert(fs.existsSync(path.join(docsDir, 'deletion-fallback-after-split-browser-proof-evidence.txt')), 'deletion-fallback after-split browser-proof evidence must remain present');
assert(fs.readFileSync(path.join(docsDir, 'deletion-fallback-after-split-browser-proof-evidence.txt'), 'utf8').includes('RESULT=PASS'), 'deletion-fallback after-split browser evidence must remain PASS');
assert(fs.existsSync(path.join(docsDir, 'deletion-fallback-parity-rollback-evidence.txt')), 'deletion-fallback parity/rollback evidence must remain present');
assert(fs.readFileSync(path.join(docsDir, 'deletion-fallback-parity-rollback-evidence.txt'), 'utf8').includes('Rollback result: PASS'), 'deletion-fallback rollback evidence must remain PASS');
assert(fs.existsSync(path.join(docsDir, 'push-settings-after-split-browser-proof-evidence.txt')), 'Push after-split browser evidence must remain present');
assert(fs.readFileSync(path.join(docsDir, 'push-settings-after-split-browser-proof-evidence.txt'), 'utf8').includes('RESULT=PASS'), 'Push after-split browser evidence must remain PASS');
assert(fs.existsSync(path.join(docsDir, 'push-settings-parity-rollback-evidence.txt')), 'Push parity/rollback evidence must remain present');
assert(fs.readFileSync(path.join(docsDir, 'push-settings-parity-rollback-evidence.txt'), 'utf8').includes('Rollback result: PASS'), 'Push rollback evidence must remain PASS');
assert(fs.existsSync(path.join(docsDir, 'voice-browser-proof-evidence.txt')), 'voice browser-proof evidence must remain present');
assert(fs.readFileSync(path.join(docsDir, 'voice-browser-proof-evidence.txt'), 'utf8').includes('NON_DESTRUCTIVE_VOICE_PERMISSION_DENIED_BROWSER_MOCK=PASS'), 'voice permission-denied browser evidence must remain PASS');
assert(fs.existsSync(path.join(docsDir, 'recording-start-stop-browser-proof-evidence.txt')), 'recording start-stop browser-proof evidence must remain present');
assert(fs.readFileSync(path.join(docsDir, 'recording-start-stop-browser-proof-evidence.txt'), 'utf8').includes('NON_DESTRUCTIVE_RECORDING_START_STOP_BROWSER_MOCK=PASS'), 'recording start-stop browser evidence must remain PASS');
assert(fs.existsSync(path.join(docsDir, 'recording-failure-browser-proof-evidence.txt')), 'recording failure browser-proof evidence must remain present');
assert(fs.readFileSync(path.join(docsDir, 'recording-failure-browser-proof-evidence.txt'), 'utf8').includes('NON_DESTRUCTIVE_RECORDING_FAILURE_BROWSER_MOCK=PASS'), 'recording failure browser evidence must remain PASS');
assert(fs.existsSync(path.join(docsDir, 'calls-webrtc-mocked-setup-browser-proof-evidence.txt')), 'Calls/WebRTC mocked setup browser-proof evidence must remain present');
assert(fs.readFileSync(path.join(docsDir, 'calls-webrtc-mocked-setup-browser-proof-evidence.txt'), 'utf8').includes('NON_DESTRUCTIVE_CALLS_WEBRTC_MOCKED_SETUP_BROWSER_MOCK=PASS'), 'Calls/WebRTC mocked setup browser evidence must remain PASS');
assert(fs.existsSync(path.join(docsDir, 'calls-pip-missing-video-browser-proof-evidence.txt')), 'Calls PiP missing-video browser-proof evidence must remain present');
assert(fs.readFileSync(path.join(docsDir, 'calls-pip-missing-video-browser-proof-evidence.txt'), 'utf8').includes('NON_DESTRUCTIVE_CALLS_PIP_MISSING_VIDEO_BROWSER_MOCK=PASS'), 'Calls PiP missing-video browser evidence must remain PASS');
assert(fs.existsSync(path.join(docsDir, 'calls-pip-success-browser-proof-evidence.txt')), 'Calls PiP success browser-proof evidence must remain present');
assert(fs.readFileSync(path.join(docsDir, 'calls-pip-success-browser-proof-evidence.txt'), 'utf8').includes('NON_DESTRUCTIVE_CALLS_PIP_SUCCESS_BROWSER_MOCK=PASS'), 'Calls PiP success browser evidence must remain PASS');
assert(fs.existsSync(path.join(docsDir, 'calls-pip-failure-browser-proof-evidence.txt')), 'Calls PiP failure browser-proof evidence must remain present');
assert(fs.readFileSync(path.join(docsDir, 'calls-pip-failure-browser-proof-evidence.txt'), 'utf8').includes('NON_DESTRUCTIVE_CALLS_PIP_FAILURE_BROWSER_MOCK=PASS'), 'Calls PiP failure browser evidence must remain PASS');
assert(fs.existsSync(path.join(docsDir, 'stories-empty-data-browser-proof-evidence.txt')), 'Stories empty-data browser-proof evidence must remain present');
assert(fs.readFileSync(path.join(docsDir, 'stories-empty-data-browser-proof-evidence.txt'), 'utf8').includes('NON_DESTRUCTIVE_STORIES_EMPTY_DATA_BROWSER_MOCK=PASS'), 'Stories empty-data browser evidence must remain PASS');
assert(fs.existsSync(path.join(docsDir, 'stories-image-setup-browser-proof-evidence.txt')), 'Stories synthetic-image setup browser-proof evidence must remain present');
assert(fs.readFileSync(path.join(docsDir, 'stories-image-setup-browser-proof-evidence.txt'), 'utf8').includes('NON_DESTRUCTIVE_STORIES_IMAGE_SETUP_BROWSER_MOCK=PASS'), 'Stories synthetic-image setup browser evidence must remain PASS');
assert(fs.existsSync(path.join(docsDir, 'dms-empty-state-browser-proof-evidence.txt')), 'DMs empty-state browser-proof evidence must remain present');
assert(fs.readFileSync(path.join(docsDir, 'dms-empty-state-browser-proof-evidence.txt'), 'utf8').includes('NON_DESTRUCTIVE_DMS_EMPTY_STATE_BROWSER_MOCK=PASS'), 'DMs empty-state browser evidence must remain PASS');
assert(fs.existsSync(path.join(docsDir, 'dms-refresh-no-account-browser-proof-evidence.txt')), 'DMs refresh no-account browser-proof evidence must remain present');
assert(fs.readFileSync(path.join(docsDir, 'dms-refresh-no-account-browser-proof-evidence.txt'), 'utf8').includes('NON_DESTRUCTIVE_DMS_REFRESH_NO_ACCOUNT_BROWSER_MOCK=PASS'), 'DMs refresh no-account browser evidence must remain PASS');
assert(fs.existsSync(path.join(docsDir, 'dms-refresh-current-tab-browser-proof-evidence.txt')), 'DMs refresh current-tab browser-proof evidence must remain present');
assert(fs.readFileSync(path.join(docsDir, 'dms-refresh-current-tab-browser-proof-evidence.txt'), 'utf8').includes('NON_DESTRUCTIVE_DMS_REFRESH_CURRENT_TAB_BROWSER_MOCK=PASS'), 'DMs refresh current-tab browser evidence must remain PASS');
assert(fs.existsSync(path.join(docsDir, 'reels-empty-state-browser-proof-evidence.txt')), 'Reels empty-state browser-proof evidence must remain present');
assert(fs.readFileSync(path.join(docsDir, 'reels-empty-state-browser-proof-evidence.txt'), 'utf8').includes('NON_DESTRUCTIVE_REELS_EMPTY_STATE_BROWSER_MOCK=PASS'), 'Reels empty-state browser evidence must remain PASS');
assert(fs.existsSync(path.join(docsDir, 'reels-query-error-fallback-browser-proof-evidence.txt')), 'Reels query-error fallback browser-proof evidence must remain present');
assert(fs.readFileSync(path.join(docsDir, 'reels-query-error-fallback-browser-proof-evidence.txt'), 'utf8').includes('NON_DESTRUCTIVE_REELS_QUERY_ERROR_FALLBACK_BROWSER_MOCK=PASS'), 'Reels query-error fallback browser evidence must remain PASS');
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
assert(fs.existsSync(path.join(docsDir, 'notes-removal-failure-browser-proof-evidence.txt')), 'Notes removal-failure browser-proof evidence must remain present');
assert(fs.readFileSync(path.join(docsDir, 'notes-removal-failure-browser-proof-evidence.txt'), 'utf8').includes('NON_DESTRUCTIVE_NOTES_REMOVAL_FAILURE_BROWSER_MOCK=PASS'), 'Notes removal-failure browser evidence must remain PASS');
assert(fs.existsSync(path.join(docsDir, 'notes-removal-success-browser-proof-evidence.txt')), 'Notes removal-success browser-proof evidence must remain present');
assert(fs.readFileSync(path.join(docsDir, 'notes-removal-success-browser-proof-evidence.txt'), 'utf8').includes('NON_DESTRUCTIVE_NOTES_REMOVAL_SUCCESS_BROWSER_MOCK=PASS'), 'Notes removal-success browser evidence must remain PASS');
assert(fs.existsSync(path.join(docsDir, 'notes-removal-cloud-artwork-browser-proof-evidence.txt')), 'Notes cloud-artwork removal browser-proof evidence must remain present');
assert(fs.readFileSync(path.join(docsDir, 'notes-removal-cloud-artwork-browser-proof-evidence.txt'), 'utf8').includes('NON_DESTRUCTIVE_NOTES_REMOVAL_CLOUD_ARTWORK_BROWSER_MOCK=PASS'), 'Notes cloud-artwork removal browser evidence must remain PASS');
assert(fs.existsSync(path.join(docsDir, 'note-viewer-after-split-browser-proof-evidence.txt')), 'Note viewer after-split browser evidence must remain present');
assert(fs.readFileSync(path.join(docsDir, 'note-viewer-after-split-browser-proof-evidence.txt'), 'utf8').includes('RESULT=PASS'), 'Note viewer after-split browser evidence must remain PASS');
assert(fs.existsSync(path.join(docsDir, 'note-viewer-parity-rollback-evidence.txt')), 'Note viewer rollback evidence must remain present');
assert(fs.readFileSync(path.join(docsDir, 'note-viewer-parity-rollback-evidence.txt'), 'utf8').includes('ROLLBACK_RESULT=PASS'), 'Note viewer rollback evidence must remain PASS');
assert(fs.existsSync(path.join(docsDir, 'note-deletion-browser-parity-harness.js')), 'Note deletion parity harness must remain present');
assert(fs.existsSync(path.join(docsDir, 'note-deletion-parity-rollback-evidence.txt')), 'Note deletion rollback evidence must remain present');
assert(fs.readFileSync(path.join(docsDir, 'note-deletion-parity-rollback-evidence.txt'), 'utf8').includes('NOTE_DELETION_ROLLBACK_EVIDENCE=PASS'), 'Note deletion rollback evidence must remain PASS');
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
  const expectedInlineCount = ['async function renderDMs()', 'async function renderReels()', 'function spawnLikeParticles(el){', 'async function syncLocalDeletionFallback()', 'async function enablePushFromSettings()', 'async function resetPushFromSettings()', 'async function submitNote()', 'async function deleteMyNote()', 'function renderStoryElements()', 'function openSV(startIdx){', 'async function toggleRecording(cid)', 'function createPeerConnection(callId, remoteUserId) {'].includes(signature) ? 0 : 1;
  assert.strictEqual(html.split(signature).length - 1, expectedInlineCount, `protected owner count mismatch: ${signature}`);
  if (signature === 'async function submitNote()') assert(source.includes('window.submitNote = async function submitNote()'), 'approved Notes submission owner must remain available through a window assignment');
  else if (signature === 'function openSV(startIdx){') assert(source.includes('window.openSV = function openSV('), 'approved Story viewer opener owner must remain available through a window assignment');
  else if (signature === 'async function toggleRecording(cid)') assert(source.includes('window.toggleRecording = async function toggleRecording('), 'approved Voice recording owner must remain available through a window assignment');
  else if (signature === 'function createPeerConnection(callId, remoteUserId) {') assert(source.includes('window.createPeerConnection = function createPeerConnection('), 'approved Calls/WebRTC peer owner must remain available through a window assignment');
  else assert(!source.includes(signature), `protected owner must remain outside src by declaration: ${signature}`);
}
assert(source.includes('window.renderDMs = async function(){'), 'approved DMs renderer owner must remain available through a window assignment');
assert(source.includes('window.renderReels = async function(){'), 'approved Reels renderer owner must remain available through a window assignment');
assert(source.includes('window.spawnLikeParticles = function(el){'), 'approved particle owner must remain available through a window assignment');
assert(source.includes('window.syncLocalDeletionFallback = async function() {'), 'approved deletion-fallback owner must remain available through a window assignment');
assert(source.includes('window.enablePushFromSettings = async function('), 'approved Push enable owner must remain available through a window assignment');
assert(source.includes('window.resetPushFromSettings = async function('), 'approved Push reset owner must remain available through a window assignment');
assert(source.includes('window.viewNote = async function('), 'approved Note view owner must remain available through a window assignment');
assert(source.includes('window.removeMyNoteFromViewer = async function('), 'approved Note removal owner must remain available through a window assignment');
assert(source.includes('window.renderStoryElements = function(){'), 'approved Story renderer owner must remain available through a window assignment');
assert(source.includes('window.deleteMyNote = async function(){'), 'approved Note deletion owner must remain available through a window assignment');
assert(source.includes('window.openSV = function openSV('), 'approved Story viewer opener owner must remain available through a window assignment');

assert(!source.includes('reversibleBrowserProofPassed'), 'no speculative browser-proof pass flag may be introduced');
assert(!source.includes('productionSplitApproved'), 'no speculative production-split approval flag may be introduced');

console.log('REVERSIBLE_BROWSER_PROOF_CONTRACT_HARNESS=PASS');
console.log('PROOF_STATUS=APPROVED_SPLITS_PASS_REMAINING_PROTECTED_SYSTEMS_GATED');
console.log('PROTECTED_SPLITS=9_OF_19');
console.log('DIRECT_EXTRACTION=GATED_FOR_REMAINING_INLINE_BOUNDARY_STATE_BOOTSTRAP_LISTENERS');
console.log('PRODUCTION_CHANGE=9_APPROVED_SIGNATURES');
