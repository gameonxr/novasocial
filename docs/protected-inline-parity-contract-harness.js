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

const approvedBranch2Split = 'function spawnLikeParticles(el){';
for (const signature of protectedSignatures) {
  const expectedBranch2Count = signature === approvedBranch2Split ? 0 : 1;
  assert.strictEqual(branch2Html.split(signature).length - 1, expectedBranch2Count, `Branch2 protected signature count mismatch: ${signature}`);
  assert.strictEqual(mainHtml.split(signature).length - 1, 1, `origin/main must contain exactly one protected signature: ${signature}`);
  assert.strictEqual(sourceText.includes(signature), false, `protected signature must not be extracted by declaration: ${signature}`);
}
const particleModule = fs.readFileSync(path.join(repo, 'src', 'features', 'spawn-like-particles.js'), 'utf8');
assert(particleModule.includes('window.spawnLikeParticles = function(el){'), 'approved particle module must expose the global owner');
assert(branch2Html.indexOf('src/features/spawn-like-particles.js') < branch2Html.indexOf('src/features/like-effects.js'), 'approved particle module must load before its global caller');
assert.strictEqual((particleModule.match(/window\.spawnLikeParticles\s*=\s*function\(el\)\{/g) || []).length, 1, 'approved particle module must have one window owner');

console.log('PROTECTED_INLINE_PARITY_HARNESS=PASS');
console.log(`PROTECTED_SIGNATURES=${protectedSignatures.length}`);
console.log('BRANCH2_AND_MAIN_MATCH=PASS_WITH_APPROVED_PARTICLE_SPLIT');
console.log('EXTRACTED_PROTECTED_SIGNATURES=1_APPROVED_PARTICLE');
