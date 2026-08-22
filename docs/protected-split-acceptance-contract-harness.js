const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const repo = path.resolve(__dirname, '..');
const docsDir = path.join(repo, 'docs');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const matrix = fs.readFileSync(path.join(docsDir, 'high-risk-seam-readiness-matrix-contract.md'), 'utf8');
const gate = fs.readFileSync(path.join(docsDir, 'high-risk-extraction-gate-contract.md'), 'utf8');
const sourceFiles = execFileSync('find', [path.join(repo, 'src'), '-type', 'f', '-name', '*.js'], { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
const source = sourceFiles.map(file => fs.readFileSync(file, 'utf8')).join('\n');
const particleModule = fs.readFileSync(path.join(repo, 'src', 'features', 'spawn-like-particles.js'), 'utf8');

assert(matrix.includes('Protected production splits | 1/19 signatures moved'), 'matrix must record the completed particle split');
assert(matrix.includes('Particle candidate | SPLIT_COMPLETE'), 'matrix must record particle split completion');
assert(matrix.includes('browser proof remains outstanding for 18 unapproved systems'), 'browser proof must remain explicitly outstanding for remaining systems');
assert(gate.includes('Direct extraction remains explicitly blocked for the 18 unapproved systems'), 'high-risk gate must remain blocked for remaining systems');
assert(fs.existsSync(path.join(docsDir, 'reversible-browser-proof-contract.md')), 'browser-proof contract must exist');
assert(fs.existsSync(path.join(docsDir, 'reversible-browser-proof-contract-harness.js')), 'browser-proof harness must exist');

for (const file of [
  'dms-seam-preparation-contract.md',
  'reels-seam-preparation-contract.md',
  'calls-webrtc-seam-preparation-contract.md',
  'stories-seam-preparation-contract.md',
  'notes-seam-preparation-contract.md',
  'voice-recording-seam-preparation-contract.md',
  'deletion-fallback-seam-preparation-contract.md',
  'particle-seam-preparation-contract.md',
  'push-seam-preparation-contract.md'
]) {
  assert(fs.existsSync(path.join(docsDir, file)), `seam contract missing: ${file}`);
}

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
  'async function syncLocalDeletionFallback()'
];
assert.strictEqual(protectedSignatures.length, 19, 'acceptance gate must cover all 19 protected signatures');
for (const signature of protectedSignatures) {
  const particle = signature === 'function spawnLikeParticles(el){';
  assert.strictEqual(html.split(signature).length - 1, particle ? 0 : 1, `protected signature count mismatch: ${signature}`);
  assert(!source.includes(signature), `protected signature must not be duplicated by declaration: ${signature}`);
}
assert(particleModule.includes('window.spawnLikeParticles = function(el){'), 'approved particle window owner must exist');
assert.strictEqual((particleModule.match(/window\.spawnLikeParticles\s*=\s*function\(el\)\{/g) || []).length, 1, 'approved particle owner must occur exactly once');

assert(!source.includes('protectedSplitApproved'), 'no speculative protected split approval flag may exist');
assert(!source.includes('browserProofPassed'), 'no speculative browser proof flag may exist');
assert(!source.includes('productionSplitApproved'), 'no speculative production approval flag may exist');

console.log('PROTECTED_SPLIT_ACCEPTANCE_CONTRACT_HARNESS=PASS');
console.log('DECISION=READY_FOR_PARTICLE_ONLY');
console.log('PROTECTED_SIGNATURES=19');
console.log('EXTRACTED_PROTECTED_SIGNATURES=1_APPROVED_PARTICLE');
console.log('BROWSER_PROOF=PARTICLE_PASS_REMAINING_18');
console.log('DIRECT_EXTRACTION=BLOCKED_FOR_REMAINING_PROTECTED_SYSTEMS');
console.log('PRODUCTION_CHANGE=1_PARTICLE');
