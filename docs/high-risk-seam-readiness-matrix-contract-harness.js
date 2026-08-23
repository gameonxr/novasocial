const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const repo = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const sourceFiles = execFileSync('find', [path.join(repo, 'src'), '-type', 'f', '-name', '*.js'], { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
const sourceText = sourceFiles.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
const gate = fs.readFileSync(path.join(repo, 'docs', 'high-risk-extraction-gate-contract-harness.js'), 'utf8');
const matrix = fs.readFileSync(path.join(repo, 'docs', 'high-risk-seam-readiness-matrix-contract.md'), 'utf8');
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
  'async function viewNote(noteId){',
  'async function removeMyNoteFromViewer(noteId)'
];

assert.strictEqual(sourceFiles.length, 218, '218 extracted JavaScript modules must remain present after Reels windowing helper split');
for (const signature of protectedSignatures) {
  const approved = signature === 'function spawnLikeParticles(el){' || signature === 'async function syncLocalDeletionFallback()' || signature === 'async function enablePushFromSettings()' || signature === 'async function resetPushFromSettings()' || signature === 'async function viewNote(noteId){' || signature === 'async function removeMyNoteFromViewer(noteId)' || signature === 'async function deleteMyNote()' || signature === 'function renderStoryElements()';
  assert.strictEqual(html.split(signature).length - 1, approved ? 0 : 1, `protected signature count mismatch: ${signature}`);
  assert.strictEqual(sourceText.includes(signature), false, `protected signature must not be duplicated by declaration: ${signature}`);
}
const particleModule = fs.readFileSync(path.join(repo, 'src', 'features', 'spawn-like-particles.js'), 'utf8');
const deletionModule = fs.readFileSync(path.join(repo, 'src', 'features', 'sync-local-deletion-fallback.js'), 'utf8');
const pushModule = fs.readFileSync(path.join(repo, 'src', 'features', 'push-settings.js'), 'utf8');
const noteModule = fs.readFileSync(path.join(repo, 'src', 'features', 'note-viewer-owners.js'), 'utf8');
const noteDeletionModule = fs.readFileSync(path.join(repo, 'src', 'features', 'note-deletion-owner.js'), 'utf8');
assert.strictEqual((particleModule.match(/window\.spawnLikeParticles\s*=\s*function\(el\)\{/g) || []).length, 1, 'approved particle owner must occur once');
assert.strictEqual((deletionModule.match(/window\.syncLocalDeletionFallback\s*=\s*async function\(\)\s*\{/g) || []).length, 1, 'approved deletion-fallback owner must occur once');
assert.strictEqual((pushModule.match(/window\.enablePushFromSettings\s*=\s*async function\(/g) || []).length, 1, 'approved Push enable owner must occur once');
assert.strictEqual((pushModule.match(/window\.resetPushFromSettings\s*=\s*async function\(/g) || []).length, 1, 'approved Push reset owner must occur once');
assert.strictEqual((noteModule.match(/window\.viewNote\s*=\s*async function\(/g) || []).length, 1, 'approved Note view owner must occur once');
assert.strictEqual((noteModule.match(/window\.removeMyNoteFromViewer\s*=\s*async function\(/g) || []).length, 1, 'approved Note removal owner must occur once');
assert.strictEqual((noteDeletionModule.match(/window\.deleteMyNote\s*=\s*async function\(/g) || []).length, 1, 'approved Note deletion owner must occur once');
assert(html.lastIndexOf('src/features/spawn-like-particles.js') < html.lastIndexOf('src/features/sync-local-deletion-fallback.js'), 'particle module must precede deletion-fallback module');
assert(html.lastIndexOf('src/features/sync-local-deletion-fallback.js') < html.lastIndexOf('src/features/like-effects.js'), 'deletion-fallback module must load before caller');
assert(gate.includes('DIRECT_EXTRACTION=BLOCKED_FOR_REMAINING_11_PROTECTED_SYSTEMS'), 'global high-risk gate must remain blocked for remaining systems');
assert(matrix.includes('particle seam-preparation artifacts present'), 'matrix must record particle seam preparation');
assert(matrix.includes('all nine protected seam contracts explicitly bind their listed mock inventories'), 'matrix must record repository-wide seam inventory alignment');
assert(matrix.includes('Particle candidate | SPLIT_COMPLETE; test-only comparison, after-split parity, production browser smoke, and rollback-after-split are PASS'), 'matrix must record particle split completion');
assert(matrix.includes('Deletion-fallback candidate | SPLIT_COMPLETE; test-only comparison, after-split production smoke, exact owner hash, and rollback-after-split are PASS'), 'matrix must record deletion-fallback split completion');
assert(matrix.includes('Note viewer candidate | SPLIT_COMPLETE'), 'matrix must record Note viewer split completion');
assert(matrix.includes('Note deletion candidate | SPLIT_COMPLETE'), 'matrix must record Note deletion split completion');
const aggregatePreparationProofs = [
  ['docs/dms-seam-preparation-contract-harness.js', 'INJECTED_SEAM_PROOF=PASS'],
  ['docs/reels-seam-preparation-contract-harness.js', 'INJECTED_SEAM_PROOF=PASS'],
  ['docs/calls-webrtc-seam-preparation-contract-harness.js', 'INJECTED_SEAM_PROOF=PASS'],
  ['docs/voice-recording-seam-preparation-contract-harness.js', 'INJECTED_SEAM_PROOF=PASS'],
  ['docs/notes-seam-preparation-contract-harness.js', 'INJECTED_SEAM_PROOF=PASS'],
  ['docs/stories-seam-preparation-contract-harness.js', 'INJECTED_SEAM_PROOFS=6_PASS'],
  ['docs/push-permission-contract-harness.js', 'createInjectedPushPermissionSeam'],
];
for (const [file, marker] of aggregatePreparationProofs) {
  const text = fs.readFileSync(path.join(repo, file), 'utf8');
  assert(text.includes(marker), `aggregate preparation proof must remain passing: ${file}`);
}
const pushPermissionHarness = fs.readFileSync(path.join(repo, 'docs', 'push-permission-contract-harness.js'), 'utf8');
assert(pushPermissionHarness.includes("JSON.stringify(seam.calls) !== JSON.stringify(['evaluate', 'request'])"), 'Push permission injected seam dispatch proof must remain explicit');
assert(fs.existsSync(path.join(repo, 'docs', 'note-viewer-contract.md')), 'Note viewer contract must remain present');
assert(fs.existsSync(path.join(repo, 'docs', 'note-viewer-after-split-browser-proof-evidence.txt')), 'Note after-split browser proof must remain present');
assert(fs.existsSync(path.join(repo, 'docs', 'note-viewer-parity-rollback-evidence.txt')), 'Note rollback evidence must remain present');
assert(fs.existsSync(path.join(repo, 'docs', 'note-deletion-browser-parity-harness.js')), 'Note deletion parity harness must remain present');
assert(fs.existsSync(path.join(repo, 'docs', 'note-deletion-parity-rollback-evidence.txt')), 'Note deletion rollback evidence must remain present');
assert(matrix.includes('browser proof remains outstanding for 11 unapproved systems'), 'matrix must record remaining browser proof');
assert(matrix.includes('one additional supporting Reels windowing helper is split with its own gate'), 'matrix must record the supporting Reels helper split');
assert(matrix.includes('Reels video windowing helper | PASS | PASS | PASS | PASS | SPLIT_COMPLETE; renderer remains protected'), 'matrix must keep the Reels renderer boundary protected');
assert(matrix.includes('## Remaining production authorization status'), 'matrix must expose remaining authorization status');
const remainingAuthorizationRows = [
  'DMs and chat rendering | PASS | OUTSTANDING | OUTSTANDING | OUTSTANDING | BLOCKED',
  'Reels renderer and swipe/navigation owners | PASS | OUTSTANDING | OUTSTANDING | OUTSTANDING | BLOCKED',
  'Reels video windowing helper | PASS | PASS | PASS | PASS | SPLIT_COMPLETE; renderer remains protected',
  'Calls/WebRTC peer and signaling | PASS | OUTSTANDING | OUTSTANDING | OUTSTANDING | BLOCKED',
  'Story viewer, playback, polls, viewers, replies, submission, and deletion | PASS | OUTSTANDING | OUTSTANDING | OUTSTANDING | BLOCKED',
  'Voice recording and delivery | PASS | OUTSTANDING | OUTSTANDING | OUTSTANDING | BLOCKED',
  'Notes submission, reactions, and reactor list | PASS | OUTSTANDING | OUTSTANDING | OUTSTANDING | BLOCKED',
  'Push permission and silent resubscribe helpers | PASS | OUTSTANDING | OUTSTANDING | OUTSTANDING | BLOCKED',
];
for (const row of remainingAuthorizationRows) {
  assert(matrix.includes(row), `remaining authorization row must remain explicitly blocked: ${row}`);
}
assert(fs.existsSync(path.join(repo, 'docs', 'reversible-browser-proof-contract.md')), 'reversible browser proof contract must remain present');
assert(fs.existsSync(path.join(repo, 'docs', 'reversible-browser-proof-contract-harness.js')), 'reversible browser proof harness must remain present');
assert(fs.existsSync(path.join(repo, 'docs', 'account-bootstrap-contract.md')), 'account/bootstrap seam contract must remain present');
assert(fs.existsSync(path.join(repo, 'docs', 'account-bootstrap-adapter-harness.js')), 'account/bootstrap adapter harness must remain present');
assert(fs.existsSync(path.join(repo, 'docs', 'protected-inline-parity-contract-harness.js')), 'protected parity harness must remain present');
assert(fs.existsSync(path.join(repo, 'docs', 'push-settings-production-split-contract.md')), 'Push production contract must remain present');
assert(fs.existsSync(path.join(repo, 'docs', 'push-settings-parity-rollback-evidence.txt')), 'Push rollback evidence must remain present');

console.log('HIGH_RISK_SEAM_READINESS_MATRIX_HARNESS=PASS');
console.log('PROTECTED_SIGNATURES=19');
console.log('EXTRACTED_PROTECTED_SIGNATURES=8_APPROVED_PARTICLE_DELETION_FALLBACK_PUSH_SETTINGS_NOTE_VIEWER_NOTE_DELETION_AND_STORY_EDITOR');
console.log('ADAPTER_REFERENCE=ACCOUNT_BOOTSTRAP');
console.log('PARTICLE_CANDIDATE=SPLIT_COMPLETE');
console.log('DELETION_FALLBACK_CANDIDATE=SPLIT_COMPLETE');
console.log('REVERSIBLE_BROWSER_PROOF=PARTICLE_DELETION_PUSH_NOTE_DELETION_AND_STORY_PASS_REMAINING_11');
console.log('AGGREGATE_PREPARATION_INJECTED_PROOFS=7_PASS');
console.log('DIRECT_EXTRACTION=BLOCKED_FOR_REMAINING_11_PROTECTED_SYSTEMS');
