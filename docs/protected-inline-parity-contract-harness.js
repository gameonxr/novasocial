const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const repo = '/home/ubuntu/novasocial';
const branch2Html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const mainHtml = execFileSync('git', ['-C', repo, 'show', 'origin/main:index.html'], { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
const sourceFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(fullPath);
    else if (entry.name.endsWith('.js')) sourceFiles.push(fullPath);
  }
}
walk(path.join(repo, 'src'));
const sourceText = sourceFiles.map(file => fs.readFileSync(file, 'utf8')).join('\n');
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

const approvedBranch2Splits = new Set(['function spawnLikeParticles(el){', 'async function syncLocalDeletionFallback()', 'async function enablePushFromSettings()', 'async function resetPushFromSettings()', 'function renderStoryElements()']);
for (const signature of protectedSignatures) {
  const expectedBranch2Count = approvedBranch2Splits.has(signature) ? 0 : 1;
  assert.strictEqual(branch2Html.split(signature).length - 1, expectedBranch2Count, `Branch2 protected signature count mismatch: ${signature}`);
  assert.strictEqual(mainHtml.split(signature).length - 1, 1, `origin/main must contain exactly one protected signature: ${signature}`);
  assert.strictEqual(sourceText.includes(signature), false, `protected signature must not be extracted by declaration: ${signature}`);
}
const particleModule = fs.readFileSync(path.join(repo, 'src', 'features', 'spawn-like-particles.js'), 'utf8');
const deletionModule = fs.readFileSync(path.join(repo, 'src', 'features', 'sync-local-deletion-fallback.js'), 'utf8');
const pushModule = fs.readFileSync(path.join(repo, 'src', 'features', 'push-settings.js'), 'utf8');
const storyModule = fs.readFileSync(path.join(repo, 'src', 'features', 'story-editor-owners.js'), 'utf8');
assert(particleModule.includes('window.spawnLikeParticles = function(el){'), 'approved particle module must expose the global owner');
assert(deletionModule.includes('window.syncLocalDeletionFallback = async function() {'), 'approved deletion-fallback module must expose the global owner');
assert(branch2Html.indexOf('src/features/spawn-like-particles.js') < branch2Html.indexOf('src/features/sync-local-deletion-fallback.js'), 'particle module must load before deletion-fallback module');
assert(branch2Html.indexOf('src/features/sync-local-deletion-fallback.js') < branch2Html.indexOf('src/features/push-settings.js'), 'deletion-fallback module must load before Push settings');
assert(branch2Html.indexOf('src/features/push-settings.js') < branch2Html.indexOf('src/features/like-effects.js'), 'Push settings module must load before its global caller');
assert.strictEqual((particleModule.match(/window\.spawnLikeParticles\s*=\s*function\(el\)\{/g) || []).length, 1, 'approved particle module must have one window owner');
assert.strictEqual((deletionModule.match(/window\.syncLocalDeletionFallback\s*=\s*async function\(\)\s*\{/g) || []).length, 1, 'approved deletion-fallback module must have one window owner');
assert.strictEqual((pushModule.match(/window\.enablePushFromSettings\s*=\s*async function\(/g) || []).length, 1, 'approved Push enable module must have one window owner');
assert.strictEqual((pushModule.match(/window\.resetPushFromSettings\s*=\s*async function\(/g) || []).length, 1, 'approved Push reset module must have one window owner');
assert.strictEqual((storyModule.match(/window\.renderStoryElements\s*=\s*function\(\)\{/g) || []).length, 1, 'approved Story module must have one window owner');

console.log('PROTECTED_INLINE_PARITY_HARNESS=PASS');
console.log(`PROTECTED_SIGNATURES=${protectedSignatures.length}`);
console.log('BRANCH2_AND_MAIN_MATCH=PASS_WITH_FOUR_APPROVED_OWNER_SIGNATURES');
console.log('EXTRACTED_PROTECTED_SIGNATURES=4_APPROVED_PARTICLE_DELETION_FALLBACK_AND_PUSH_SETTINGS');
