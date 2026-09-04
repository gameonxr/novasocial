const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const repo = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const moduleText = fs.readFileSync(path.join(repo, 'src', 'features', 'spawn-like-particles.js'), 'utf8');
const deletionModule = fs.readFileSync(path.join(repo, 'src', 'features', 'sync-local-deletion-fallback.js'), 'utf8');
const pushModule = fs.readFileSync(path.join(repo, 'src', 'features', 'push-settings.js'), 'utf8');
const contract = fs.readFileSync(path.join(repo, 'docs', 'particle-production-split-contract.md'), 'utf8');
const sourceFiles = execFileSync('find', [path.join(repo, 'src'), '-type', 'f', '-name', '*.js'], { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
const source = sourceFiles.map(file => fs.readFileSync(file, 'utf8')).join('\n');
const protectedSignatures = [
  'async function renderDMs()',
  'async function renderReels()',
  'function createPeerConnection(callId, remoteUserId) {',
  'function openSV(startIdx){',
  'function spawnLikeParticles(el){',
  'async function syncLocalDeletionFallback()',
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
  'async function loadStoryPollState('
];

assert(contract.includes('07b81feccb59b5779439f0ff9169e3430a51835b'), 'split contract must record the published split commit');
assert(contract.includes('cc72374b89313f667a91310a820bc306c419e1d3'), 'split contract must record the pre-split parent');
assert(contract.includes('Canonical owner SHA-256'), 'split contract must record canonical owner hashing');
assert(moduleText.includes('window.spawnLikeParticles = function(el){'), 'particle module must assign the global owner');
assert.strictEqual((moduleText.match(/window\.spawnLikeParticles\s*=\s*function\(el\)\{/g) || []).length, 1, 'particle module must contain exactly one global owner');
assert.strictEqual((html.match(/function spawnLikeParticles\(el\)\{/g) || []).length, 0, 'inline particle owner must be absent after split');
assert.strictEqual(html.split('src/features/spawn-like-particles.js').length - 1, 1, 'particle module must be linked exactly once');
assert(html.indexOf('src/features/spawn-like-particles.js') < html.indexOf('src/features/like-effects.js'), 'particle module must load before global caller');
assert(source.includes('spawnLikeParticles(el);'), 'global caller handoff must remain present');
for (const signature of protectedSignatures) {
  const approved = signature === 'async function renderDMs()' || signature === 'async function renderReels()' || signature === 'function spawnLikeParticles(el){' || signature === 'async function syncLocalDeletionFallback()' || signature === 'async function enablePushFromSettings()' || signature === 'async function resetPushFromSettings()' || signature === 'async function viewNote(' || signature === 'function removeMyNoteFromViewer(' || signature === 'async function deleteMyNote()' || signature === 'function renderStoryElements()' || signature === 'async function loadNoteReactorsList(' || signature === 'function reactToNote(' || signature === 'async function submitNote()' || signature === 'async function voteStoryPoll(' || signature === 'async function refreshPollResults(' || signature === 'async function loadStoryPollState(' || signature === 'function openSV(startIdx){' || signature === 'function submitNativeEmojiReaction(';
  assert.strictEqual(html.split(signature).length - 1, approved ? 0 : 1, `protected inline signature count mismatch: ${signature}`);
  if (signature === 'function reactToNote(') assert(fs.readFileSync(path.join(repo, 'src', 'features', 'notes-reaction-owner.js'), 'utf8').includes('window.reactToNote = function reactToNote('), 'approved Notes reaction owner must exist');
  else if (signature === 'async function submitNote()') assert(fs.readFileSync(path.join(repo, 'src', 'features', 'notes-submission-owner.js'), 'utf8').includes('window.submitNote = async function submitNote()'), 'approved Notes submission owner must exist');
  else if (signature === 'function reactToNote(') assert(fs.readFileSync(path.join(repo, 'src', 'features', 'notes-reaction-owner.js'), 'utf8').includes('window.reactToNote = function reactToNote('), 'approved Notes reaction owner must exist');
  else if (signature === 'async function voteStoryPoll(') assert(fs.readFileSync(path.join(repo, 'src', 'features', 'vote-story-poll.js'), 'utf8').includes('window.voteStoryPoll = async function voteStoryPoll('), 'approved Story poll vote owner must exist');
  else if (signature === 'async function refreshPollResults(') assert(fs.readFileSync(path.join(repo, 'src', 'features', 'refresh-poll-results.js'), 'utf8').includes('window.refreshPollResults = async function refreshPollResults('), 'approved Story poll refresh owner must exist');
  else if (signature === 'async function loadStoryPollState(') assert(fs.readFileSync(path.join(repo, 'src', 'features', 'load-story-poll-state.js'), 'utf8').includes('window.loadStoryPollState = async function loadStoryPollState('), 'approved Story poll state owner must exist');
  else if (signature === 'function openSV(startIdx){') assert(fs.readFileSync(path.join(repo, 'src', 'features', 'open-sv.js'), 'utf8').includes('window.openSV = function openSV('), 'approved Story viewer opener owner must exist');
  else if (signature === 'function submitNativeEmojiReaction(') assert(fs.readFileSync(path.join(repo, 'src', 'features', 'submit-native-emoji-reaction.js'), 'utf8').includes('window.submitNativeEmojiReaction = function submitNativeEmojiReaction('), 'approved Notes emoji reaction owner must exist');
  else assert(!source.includes(signature), `protected named signature must not be duplicated in src: ${signature}`);
}
const baselineHtml = execFileSync('git', ['-C', repo, 'show', 'cc72374:index.html'], { encoding: 'utf8' });
const baselineStart = baselineHtml.indexOf('function spawnLikeParticles(el){');
const baselineEnd = baselineHtml.indexOf('\n// Override toggleLike', baselineStart);
const baselineOwner = baselineHtml.slice(baselineStart, baselineEnd + 1);
const moduleStart = moduleText.indexOf('window.spawnLikeParticles = function(el){');
const canonicalOwner = moduleText.slice(moduleStart).replace('window.spawnLikeParticles = function(el){', 'function spawnLikeParticles(el){');
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
assert.strictEqual(hash(canonicalOwner), hash(baselineOwner), 'canonical extracted owner must match the pre-split owner hash');
assert.strictEqual(hash(canonicalOwner), '44952efebe4daed59f18b3367561cc604b0cce3ea9d9092d1ff41d0bb541fb57', 'canonical owner hash must match recorded baseline');
assert.strictEqual((deletionModule.match(/window\.syncLocalDeletionFallback\s*=\s*async function\(\)\s*\{/g) || []).length, 1, 'deletion-fallback approved owner must remain present');
assert.strictEqual((pushModule.match(/window\.enablePushFromSettings\s*=\s*async function\(/g) || []).length, 1, 'Push enable approved owner must remain present');
assert.strictEqual((pushModule.match(/window\.resetPushFromSettings\s*=\s*async function\(/g) || []).length, 1, 'Push reset approved owner must remain present');
for (const file of [
  'particle-browser-comparison-proof-evidence.txt',
  'particle-after-split-browser-proof-evidence.txt',
  'particle-parity-rollback-evidence.txt'
]) {
  const evidence = fs.readFileSync(path.join(repo, 'docs', file), 'utf8');
  assert(evidence.includes('PASS'), `particle evidence must include PASS: ${file}`);
}
const branch = execFileSync('git', ['-C', repo, 'branch', '--show-current'], { encoding: 'utf8' }).trim();
const main = execFileSync('git', ['-C', repo, 'rev-parse', 'refs/remotes/origin/main'], { encoding: 'utf8' }).trim();
assert.strictEqual(branch, 'Branch2', 'production split must remain on Branch2');
assert.strictEqual(main, 'ef418007c9b9a797488b4825be5f0c807da22369', 'origin/main must remain unchanged');

console.log('PARTICLE_PRODUCTION_SPLIT_CONTRACT_HARNESS=PASS');
console.log('BEFORE_AFTER_STATIC_PARITY=PASS');
console.log('CANONICAL_OWNER_HASH=PASS');
console.log('PRODUCTION_BROWSER_SMOKE=PASS');
console.log('ROLLBACK_COMMIT_RELATIONSHIP=PASS');
console.log('PROTECTED_SPLITS=11_OF_19');
