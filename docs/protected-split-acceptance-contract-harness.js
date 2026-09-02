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
const deletionModule = fs.readFileSync(path.join(repo, 'src', 'features', 'sync-local-deletion-fallback.js'), 'utf8');
const pushModule = fs.readFileSync(path.join(repo, 'src', 'features', 'push-settings.js'), 'utf8');
const noteModule = fs.readFileSync(path.join(repo, 'src', 'features', 'note-viewer-owners.js'), 'utf8');
const noteDeletionModule = fs.readFileSync(path.join(repo, 'src', 'features', 'note-deletion-owner.js'), 'utf8');
const storyModule = fs.readFileSync(path.join(repo, 'src', 'features', 'story-editor-owners.js'), 'utf8');
const dmsModule = fs.readFileSync(path.join(repo, 'src', 'features', 'dms-renderer-owner.js'), 'utf8');
const reelsModule = fs.readFileSync(path.join(repo, 'src', 'features', 'reels-renderer-owner.js'), 'utf8');

assert(matrix.includes('Protected production splits | 14/19 protected signatures moved; 14 bounded scopes are split-complete, including Notes submission; authenticated reaction invocation remains intentionally unperformed'), 'matrix must record the fourteen moved protected signatures and supporting Reels helper');
assert(matrix.includes('Particle candidate | SPLIT_COMPLETE'), 'matrix must record particle split completion');
assert(matrix.includes('Deletion-fallback candidate | SPLIT_COMPLETE'), 'matrix must record deletion-fallback split completion');
assert(matrix.includes('fresh Notes reaction deployment observation') && matrix.includes('7 unapproved systems'), 'browser proof must remain explicitly outstanding for remaining systems');
assert(gate.includes('Direct extraction remains explicitly blocked for the 5 unapproved systems'), 'high-risk gate must remain blocked for remaining systems');
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
  'push-seam-preparation-contract.md',
  'note-viewer-contract.md'
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
  const approved = signature === 'async function renderDMs()' || signature === 'async function renderReels()' || signature === 'function spawnLikeParticles(el){' || signature === 'async function syncLocalDeletionFallback()' || signature === 'async function enablePushFromSettings()' || signature === 'async function resetPushFromSettings()' || signature === 'async function deleteMyNote()' || signature === 'function renderStoryElements()' || signature === 'async function loadNoteReactorsList(' || signature === 'function reactToNote(' || signature === 'async function submitNote()';
  assert.strictEqual(html.split(signature).length - 1, approved ? 0 : 1, `protected signature count mismatch: ${signature}`);
  if (signature === 'async function submitNote()') assert(fs.readFileSync(path.join(repo, 'src', 'features', 'notes-submission-owner.js'), 'utf8').includes('window.submitNote = async function submitNote()'), 'approved Notes submission owner must exist');
  else if (signature === 'function reactToNote(') assert(fs.readFileSync(path.join(repo, 'src', 'features', 'notes-reaction-owner.js'), 'utf8').includes('window.reactToNote = function reactToNote('), 'approved Notes reaction owner must exist');
  else assert(!source.includes(signature), `protected signature must not be duplicated by declaration: ${signature}`);
}
assert(particleModule.includes('window.spawnLikeParticles = function(el){'), 'approved particle window owner must exist');
assert.strictEqual((particleModule.match(/window\.spawnLikeParticles\s*=\s*function\(el\)\{/g) || []).length, 1, 'approved particle owner must occur exactly once');
assert(deletionModule.includes('window.syncLocalDeletionFallback = async function() {'), 'approved deletion-fallback window owner must exist');
assert.strictEqual((deletionModule.match(/window\.syncLocalDeletionFallback\s*=\s*async function\(\)\s*\{/g) || []).length, 1, 'approved deletion-fallback owner must occur exactly once');
assert.strictEqual((pushModule.match(/window\.enablePushFromSettings\s*=\s*async function\(/g) || []).length, 1, 'approved Push enable owner must occur exactly once');
assert.strictEqual((pushModule.match(/window\.resetPushFromSettings\s*=\s*async function\(/g) || []).length, 1, 'approved Push reset owner must occur exactly once');
assert.strictEqual((noteModule.match(/window\.viewNote\s*=\s*async function\(/g) || []).length, 1, 'approved Note view owner must occur exactly once');
assert.strictEqual((noteModule.match(/window\.removeMyNoteFromViewer\s*=\s*async function\(/g) || []).length, 1, 'approved Note removal owner must occur exactly once');
assert.strictEqual((noteDeletionModule.match(/window\.deleteMyNote\s*=\s*async function\(/g) || []).length, 1, 'approved Note deletion owner must occur exactly once');
assert.strictEqual((storyModule.match(/window\.renderStoryElements\s*=\s*function\(\)\{/g) || []).length, 1, 'approved Story renderer owner must occur exactly once');
assert.strictEqual((dmsModule.match(/window\.renderDMs\s*=\s*async function\(\)\{/g) || []).length, 1, 'approved DMs renderer owner must occur exactly once');
assert.strictEqual((reelsModule.match(/window\.renderReels\s*=\s*async function\(\)\{/g) || []).length, 1, 'approved Reels renderer owner must occur exactly once');
assert(fs.existsSync(path.join(docsDir, 'note-viewer-after-split-browser-proof-evidence.txt')), 'Note after-split browser proof must exist');
assert(fs.existsSync(path.join(docsDir, 'note-viewer-parity-rollback-evidence.txt')), 'Note rollback evidence must exist');
assert(fs.existsSync(path.join(docsDir, 'note-deletion-browser-parity-harness.js')), 'Note deletion parity harness must exist');
assert(fs.existsSync(path.join(docsDir, 'note-deletion-parity-rollback-evidence.txt')), 'Note deletion rollback evidence must exist');

assert(!source.includes('protectedSplitApproved'), 'no speculative protected split approval flag may exist');
assert(!source.includes('browserProofPassed'), 'no speculative browser proof flag may exist');
assert(!source.includes('productionSplitApproved'), 'no speculative production approval flag may exist');

console.log('PROTECTED_SPLIT_ACCEPTANCE_CONTRACT_HARNESS=PASS');
console.log('DECISION=NOTES_REACTION_VALIDATION_PENDING_AFTER_TWELVE_EXTERNALIZED_PROTECTED_OWNERS');
console.log('PROTECTED_SIGNATURES=19');
console.log('EXTRACTED_PROTECTED_SIGNATURES=12_APPROVED_REELS_DMS_PARTICLE_DELETION_FALLBACK_PUSH_SETTINGS_NOTE_VIEWER_NOTE_DELETION_STORY_EDITOR_REACTOR_LIST_AND_REACT_TO_NOTE');
console.log('BROWSER_PROOF=DMS_PARTICLE_DELETION_PUSH_NOTE_DELETION_STORY_REELS_HELPER_AND_REACTOR_LIST_PASS_NOTES_REACTION_DEPLOYMENT_OBSERVATION_PENDING');
console.log('DIRECT_EXTRACTION=BLOCKED_FOR_REMAINING_7_UNAPPROVED_PROTECTED_SYSTEMS');
console.log('PRODUCTION_CHANGE=12_EXTERNALIZED_PROTECTED_OWNERS');
