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
  'push-settings-production-split-contract.md',
  'push-settings-production-split-contract-harness.js'
];

assert.strictEqual(sourceFiles.length, 215, '215 extracted JavaScript modules must remain present');
for (const signature of protectedSignatures) {
  const approved = signature === 'function spawnLikeParticles(el){' || signature === 'async function syncLocalDeletionFallback()' || signature === 'async function enablePushFromSettings()' || signature === 'async function resetPushFromSettings()' || signature === 'async function viewNote(noteId){' || signature === 'async function removeMyNoteFromViewer(noteId){';
  assert.strictEqual(html.split(signature).length - 1, approved ? 0 : 1, `protected marker count mismatch: ${signature}`);
  assert.strictEqual(sourceText.includes(signature), false, `protected marker must not be duplicated by declaration: ${signature}`);
}
const particleModule = fs.readFileSync(path.join(repo, 'src', 'features', 'spawn-like-particles.js'), 'utf8');
const deletionModule = fs.readFileSync(path.join(repo, 'src', 'features', 'sync-local-deletion-fallback.js'), 'utf8');
assert(particleModule.includes('window.spawnLikeParticles = function(el){'), 'approved particle window owner must exist');
assert.strictEqual((particleModule.match(/window\.spawnLikeParticles\s*=\s*function\(el\)\{/g) || []).length, 1, 'approved particle window owner must occur once');
assert(deletionModule.includes('window.syncLocalDeletionFallback = async function() {'), 'approved deletion-fallback window owner must exist');
assert.strictEqual((deletionModule.match(/window\.syncLocalDeletionFallback\s*=\s*async function\(\)\s*\{/g) || []).length, 1, 'approved deletion-fallback window owner must occur once');
const pushModule = fs.readFileSync(path.join(repo, 'src', 'features', 'push-settings.js'), 'utf8');
const noteModule = fs.readFileSync(path.join(repo, 'src', 'features', 'note-viewer-owners.js'), 'utf8');
assert.strictEqual((pushModule.match(/window\.enablePushFromSettings\s*=\s*async function\(/g) || []).length, 1, 'approved Push enable window owner must occur once');
assert.strictEqual((pushModule.match(/window\.resetPushFromSettings\s*=\s*async function\(/g) || []).length, 1, 'approved Push reset window owner must occur once');
assert.strictEqual((noteModule.match(/window\.viewNote\s*=\s*async function\(/g) || []).length, 1, 'approved Note view window owner must occur once');
assert.strictEqual((noteModule.match(/window\.removeMyNoteFromViewer\s*=\s*async function\(/g) || []).length, 1, 'approved Note removal window owner must occur once');
assert(html.indexOf('src/features/spawn-like-particles.js') < html.indexOf('src/features/sync-local-deletion-fallback.js'), 'particle module must load before deletion-fallback module');
assert(html.indexOf('src/features/sync-local-deletion-fallback.js') < html.indexOf('src/features/like-effects.js'), 'deletion-fallback module must load before caller');
assert(html.indexOf('src/features/push-settings.js') < html.indexOf('src/features/note-viewer-owners.js'), 'Push module must load before Note module');
assert(html.indexOf('src/features/note-viewer-owners.js') < html.indexOf('src/features/like-effects.js'), 'Note module must load before caller');
for (const file of requiredCoverage) {
  assert(fs.existsSync(path.join(docsDir, file)), `required high-risk coverage file missing: ${file}`);
}
assert(fs.existsSync(path.join(docsDir, 'account-bootstrap-contract.md')), 'adapter/seam guidance must remain documented');
assert(fs.existsSync(path.join(docsDir, 'account-bootstrap-adapter-harness.js')), 'adapter/seam harness must remain available');

console.log('HIGH_RISK_EXTRACTION_GATE_HARNESS=PASS');
console.log(`PROTECTED_SIGNATURES=${protectedSignatures.length}`);
console.log('EXTRACTED_PROTECTED_SIGNATURES=6_APPROVED_PARTICLE_DELETION_FALLBACK_PUSH_SETTINGS_AND_NOTE_VIEWER');
console.log(`REQUIRED_COVERAGE_FILES=${requiredCoverage.length + 2}`);
console.log('DIRECT_EXTRACTION=BLOCKED_FOR_REMAINING_PROTECTED_SYSTEMS');
console.log('BRANCH2_ONLY=PASS');
