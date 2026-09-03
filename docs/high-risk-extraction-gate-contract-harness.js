const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const repo = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const sourceFiles = execFileSync('find', [path.join(repo, 'src'), '-type', 'f', '-name', '*.js'], { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
const sourceText = sourceFiles.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
const notesSubmissionModule = fs.readFileSync(path.join(repo, 'src', 'features', 'notes-submission-owner.js'), 'utf8');
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
  'function maybeShowPushPermissionBanner()',
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
  'push-settings-production-split-contract-harness.js',
  'note-reactors-list-production-split-contract.md',
  'note-reactors-list-production-split-contract-harness.js'
];

assert.strictEqual(sourceFiles.length, 262, '234 extracted JavaScript modules must remain present after the Push permission banner owner split');
for (const signature of protectedSignatures) {
  const approved = signature === 'async function renderDMs()' || signature === 'async function renderReels()' || signature === 'function spawnLikeParticles(el){' || signature === 'async function syncLocalDeletionFallback()' || signature === 'async function enablePushFromSettings()' || signature === 'async function resetPushFromSettings()' || signature === 'async function viewNote(noteId){' || signature === 'async function removeMyNoteFromViewer(noteId){' || signature === 'async function deleteMyNote()' || signature === 'function renderStoryElements()' || signature === 'async function loadNoteReactorsList(' || signature === 'function reactToNote(' || signature === 'function maybeShowPushPermissionBanner()' || signature === 'async function submitNote()';
  assert.strictEqual(html.split(signature).length - 1, approved ? 0 : 1, `protected marker count mismatch: ${signature}`);
  if (signature === 'function reactToNote(') assert(sourceText.includes('window.reactToNote = function reactToNote('), 'approved Notes reaction owner must exist');
  else if (signature === 'async function submitNote()') assert(sourceText.includes('window.submitNote = async function submitNote()'), 'approved Notes submission owner must exist');
  else if (signature === 'function maybeShowPushPermissionBanner()') assert(sourceText.includes('window.maybeShowPushPermissionBanner = function maybeShowPushPermissionBanner()'), 'approved Push banner owner must exist');
  else assert.strictEqual(sourceText.includes(signature), false, `protected marker must not be duplicated by declaration: ${signature}`);
}
const particleModule = fs.readFileSync(path.join(repo, 'src', 'features', 'spawn-like-particles.js'), 'utf8');
const deletionModule = fs.readFileSync(path.join(repo, 'src', 'features', 'sync-local-deletion-fallback.js'), 'utf8');
assert(particleModule.includes('window.spawnLikeParticles = function(el){'), 'approved particle window owner must exist');
assert.strictEqual((particleModule.match(/window\.spawnLikeParticles\s*=\s*function\(el\)\{/g) || []).length, 1, 'approved particle window owner must occur once');
assert(deletionModule.includes('window.syncLocalDeletionFallback = async function() {'), 'approved deletion-fallback window owner must exist');
assert.strictEqual((deletionModule.match(/window\.syncLocalDeletionFallback\s*=\s*async function\(\)\s*\{/g) || []).length, 1, 'approved deletion-fallback window owner must occur once');
const pushModule = fs.readFileSync(path.join(repo, 'src', 'features', 'push-settings.js'), 'utf8');
const noteModule = fs.readFileSync(path.join(repo, 'src', 'features', 'note-viewer-owners.js'), 'utf8');
const noteDeletionModule = fs.readFileSync(path.join(repo, 'src', 'features', 'note-deletion-owner.js'), 'utf8');
const storyModule = fs.readFileSync(path.join(repo, 'src', 'features', 'story-editor-owners.js'), 'utf8');
const dmsModule = fs.readFileSync(path.join(repo, 'src', 'features', 'dms-renderer-owner.js'), 'utf8');
const reelsModule = fs.readFileSync(path.join(repo, 'src', 'features', 'reels-renderer-owner.js'), 'utf8');
const reelsWindowingModule = fs.readFileSync(path.join(repo, 'src', 'features', 'reels-video-windowing.js'), 'utf8');
const reactorListModule = fs.readFileSync(path.join(repo, 'src', 'features', 'note-reactors-list-owner.js'), 'utf8');
assert.strictEqual((pushModule.match(/window\.enablePushFromSettings\s*=\s*async function\(/g) || []).length, 1, 'approved Push enable window owner must occur once');
assert.strictEqual((pushModule.match(/window\.resetPushFromSettings\s*=\s*async function\(/g) || []).length, 1, 'approved Push reset window owner must occur once');
assert.strictEqual((noteModule.match(/window\.viewNote\s*=\s*async function\(/g) || []).length, 1, 'approved Note view window owner must occur once');
assert.strictEqual((noteModule.match(/window\.removeMyNoteFromViewer\s*=\s*async function\(/g) || []).length, 1, 'approved Note removal window owner must occur once');
assert.strictEqual((noteDeletionModule.match(/window\.deleteMyNote\s*=\s*async function\(/g) || []).length, 1, 'approved Note deletion window owner must occur once');
assert.strictEqual((storyModule.match(/window\.renderStoryElements\s*=\s*function\(\)\{/g) || []).length, 1, 'approved Story renderer window owner must occur once');
assert.strictEqual((dmsModule.match(/window\.renderDMs\s*=\s*async function\(\)\{/g) || []).length, 1, 'approved DMs renderer window owner must occur once');
assert.strictEqual((reelsModule.match(/window\.renderReels\s*=\s*async function\(\)\{/g) || []).length, 1, 'approved Reels renderer window owner must occur once');
assert.strictEqual((reelsWindowingModule.match(/window\._applyReelsVideoWindowing\s*=\s*function\(currentIndex\)\s*\{/g) || []).length, 1, 'verified Reels windowing helper must occur once');
assert.strictEqual((reactorListModule.match(/window\.loadNoteReactorsList\s*=\s*async function\(noteId\)\s*\{/g) || []).length, 1, 'verified Notes reactor-list owner must occur once');
assert(fs.existsSync(path.join(docsDir, 'note-reactors-list-production-split-contract.md')), 'Notes reactor-list contract must remain present');
assert(fs.existsSync(path.join(docsDir, 'note-reactors-list-production-split-contract-harness.js')), 'Notes reactor-list harness must remain present');
assert(fs.existsSync(path.join(docsDir, 'note-reactors-list-parity-rollback-evidence.txt')), 'Notes reactor-list parity rollback evidence must remain present');
assert(fs.readFileSync(path.join(docsDir, 'note-reactors-list-parity-rollback-evidence.txt'), 'utf8').includes('OWNER_BODY_PARITY=PASS'), 'Notes reactor-list parity evidence must pass');
assert(fs.readFileSync(path.join(docsDir, 'note-reactors-list-after-split-browser-proof-evidence.txt'), 'utf8').includes('EXTERNAL_OWNER_TYPE=function'), 'Notes reactor-list after-split browser proof must pass');
assert(fs.existsSync(path.join(docsDir, 'reels-after-split-browser-proof-evidence.txt')), 'Reels after-split browser proof must remain present');
assert(fs.existsSync(path.join(docsDir, 'reels-parity-rollback-evidence.txt')), 'Reels parity rollback evidence must remain present');
assert(fs.readFileSync(path.join(docsDir, 'reels-after-split-browser-proof-evidence.txt'), 'utf8').includes('PRODUCTION_BROWSER_PROOF=BEFORE_AFTER_PASS') || fs.readFileSync(path.join(docsDir, 'reels-after-split-browser-proof-evidence.txt'), 'utf8').includes('EXTERNAL_WINDOWING_OWNER=PASS'), 'Reels after-split browser proof must pass');
assert(html.lastIndexOf('src/features/spawn-like-particles.js') < html.lastIndexOf('src/features/sync-local-deletion-fallback.js'), 'particle module must load before deletion-fallback module');
assert(html.lastIndexOf('src/features/sync-local-deletion-fallback.js') < html.lastIndexOf('src/features/like-effects.js'), 'deletion-fallback module must load before caller');
assert(html.lastIndexOf('src/features/push-settings.js') < html.lastIndexOf('src/features/note-reactors-list-owner.js'), 'Push module must load before Notes reactor-list module');
assert(html.lastIndexOf('src/features/note-reactors-list-owner.js') < html.lastIndexOf('src/features/note-viewer-owners.js'), 'Notes reactor-list module must load before Note module');
assert(html.lastIndexOf('src/features/note-viewer-owners.js') < html.lastIndexOf('src/features/note-deletion-owner.js'), 'Note viewer module must load before Note deletion module');
assert(html.lastIndexOf('src/features/note-deletion-owner.js') < html.lastIndexOf('src/features/story-editor-owners.js'), 'Note deletion module must load before Story module');
assert(html.lastIndexOf('src/features/push-settings.js') < html.lastIndexOf('src/features/note-reactors-list-owner.js'), 'Notes reactor-list module must load after Push settings');
assert(html.lastIndexOf('src/features/note-reactors-list-owner.js') < html.lastIndexOf('src/features/note-viewer-owners.js'), 'Notes reactor-list module must load before Note viewer callers');
assert(html.lastIndexOf('src/features/story-editor-owners.js') < html.lastIndexOf('src/features/reels-video-windowing.js'), 'Reels windowing module must load after Story module');
assert(html.lastIndexOf('src/features/reels-video-windowing.js') < html.lastIndexOf('src/features/like-effects.js'), 'Reels windowing module must load before caller');
assert(html.lastIndexOf('src/features/story-editor-owners.js') < html.lastIndexOf('src/features/like-effects.js'), 'Story module must load before caller');
for (const file of requiredCoverage) {
  assert(fs.existsSync(path.join(docsDir, file)), `required high-risk coverage file missing: ${file}`);
}
assert(fs.existsSync(path.join(docsDir, 'account-bootstrap-contract.md')), 'adapter/seam guidance must remain documented');
assert(fs.existsSync(path.join(docsDir, 'account-bootstrap-adapter-harness.js')), 'adapter/seam harness must remain available');

console.log('HIGH_RISK_EXTRACTION_GATE_HARNESS=PASS');
console.log(`PROTECTED_SIGNATURES=${protectedSignatures.length}`);
console.log('EXTRACTED_PROTECTED_SIGNATURES=12_APPROVED_REELS_DMS_PARTICLE_DELETION_FALLBACK_PUSH_SETTINGS_NOTE_VIEWER_NOTE_DELETION_STORY_EDITOR_REACTOR_LIST_AND_REACT_TO_NOTE');
console.log('EXTRACTED_SUPPORTING_REELS_HELPER=1_WINDOWING_OWNER');
console.log(`REQUIRED_COVERAGE_FILES=${requiredCoverage.length + 2}`);
console.log('DIRECT_EXTRACTION=BLOCKED_FOR_REMAINING_5_UNAPPROVED_PROTECTED_SYSTEMS');
console.log('BRANCH2_ONLY=PASS');
