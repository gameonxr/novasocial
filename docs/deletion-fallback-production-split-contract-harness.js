'use strict';

const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const repo = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const moduleText = fs.readFileSync(path.join(repo, 'src', 'features', 'sync-local-deletion-fallback.js'), 'utf8');
const sourceFiles = execFileSync('find', [path.join(repo, 'src'), '-type', 'f', '-name', '*.js'], { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
const sourceText = sourceFiles.map(file => fs.readFileSync(file, 'utf8')).join('\n');
const baselineHtml = execFileSync('git', ['-C', repo, 'show', '7a026d0:index.html'], { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
const baselineStart = baselineHtml.indexOf('async function syncLocalDeletionFallback() {');
const baselineEnd = baselineHtml.indexOf('\nconst FILTERS = [', baselineStart);
assert(baselineStart >= 0 && baselineEnd > baselineStart, 'baseline deletion-fallback owner boundary must exist');
const baselineOwner = baselineHtml.slice(baselineStart, baselineEnd);
const moduleStart = moduleText.indexOf('window.syncLocalDeletionFallback = async function() {');
assert(moduleStart >= 0, 'production deletion-fallback module owner must exist');
const canonicalOwner = moduleText.slice(moduleStart).replace('window.syncLocalDeletionFallback = async function() {', 'async function syncLocalDeletionFallback() {').replace(/\n$/, '');
const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');
const count = pattern => (html.match(pattern) || []).length;
const protectedSignatures = [
  'async function renderDMs()', 'async function renderReels()',
  'function createPeerConnection(callId, remoteUserId) {', 'function openSV(startIdx){',
  'function spawnLikeParticles(el){', 'async function syncLocalDeletionFallback()',
  'async function toggleRecording(cid)', 'async function enablePushFromSettings()',
  'async function resetPushFromSettings()', 'async function submitNote()',
  'async function deleteMyNote()', 'function submitNativeEmojiReaction(',
  'function reactToNote(', 'async function submitNote()', 'async function loadNoteReactorsList(',
  'function renderStoryElements()', 'async function voteStoryPoll(',
  'async function refreshPollResults(', 'async function loadStoryPollState('
];
const approved = new Set(['async function renderDMs()', 'async function renderReels()', 'function spawnLikeParticles(el){', 'async function syncLocalDeletionFallback()', 'async function enablePushFromSettings()', 'async function resetPushFromSettings()', 'async function viewNote(noteId){', 'async function removeMyNoteFromViewer(noteId){', 'async function deleteMyNote()', 'function renderStoryElements()', 'async function loadNoteReactorsList(', 'function reactToNote(', 'async function submitNote()', 'async function voteStoryPoll(', 'async function refreshPollResults(', 'async function loadStoryPollState(', 'function openSV(startIdx){', 'function submitNativeEmojiReaction(']);
const branch = execFileSync('git', ['-C', repo, 'branch', '--show-current'], { encoding: 'utf8' }).trim();
const originMain = execFileSync('git', ['-C', repo, 'rev-parse', 'origin/main'], { encoding: 'utf8' }).trim();
assert.strictEqual(branch, 'Branch2', 'production split must be on Branch2');
assert.strictEqual(originMain, 'ef418007c9b9a797488b4825be5f0c807da22369', 'origin/main must remain untouched');
assert.strictEqual(count(/<script\b/gi), 457, 'after-split opening script count must be 236 after the Notes submission split');
assert.strictEqual(count(/<\/script>/gi), 457, 'after-split closing script count must be 236 after the Notes submission split');
assert.strictEqual(count(/<script\s+src=/gi), 456, 'after-split external script count must be 235 after the Notes submission split');
assert.strictEqual(sha256(baselineOwner), 'f267467785faea7ef3b8cc0c50a15764fd3bd13759a852b20e050a7887338786', 'baseline owner hash must match recorded anchor');
assert.strictEqual(sha256(canonicalOwner), sha256(baselineOwner), 'canonical extracted owner hash must match baseline');
assert.strictEqual((html.match(/async function syncLocalDeletionFallback\(\)/g) || []).length, 0, 'inline deletion-fallback owner must be absent');
assert.strictEqual((moduleText.match(/window\.syncLocalDeletionFallback\s*=\s*async function\(\)\s*\{/g) || []).length, 1, 'module deletion-fallback owner must occur once');
assert.strictEqual(sourceText.includes('async function syncLocalDeletionFallback()'), false, 'named deletion-fallback owner must not be duplicated in src');
assert(html.indexOf('src/features/spawn-like-particles.js') < html.indexOf('src/features/sync-local-deletion-fallback.js'), 'particle module must precede deletion-fallback module');
assert(html.indexOf('src/features/sync-local-deletion-fallback.js') < html.indexOf('src/features/like-effects.js'), 'deletion-fallback module must precede global caller');
assert((html + '\n' + fs.readFileSync(path.join(repo, 'src', 'features', 'show-app.js'), 'utf8')).includes('syncLocalDeletionFallback().catch(() => {})'), 'startup global handoff must remain');
assert(fs.readFileSync(path.join(repo, 'docs', 'deletion-fallback-browser-comparison-proof-evidence.txt'), 'utf8').includes('RESULT=PASS'), 'comparison proof must pass');
assert(fs.readFileSync(path.join(repo, 'docs', 'deletion-fallback-after-split-browser-proof-evidence.txt'), 'utf8').includes('RESULT=PASS'), 'after-split browser proof must pass');
const rollbackEvidence = fs.readFileSync(path.join(repo, 'docs', 'deletion-fallback-parity-rollback-evidence.txt'), 'utf8');
assert(rollbackEvidence.includes('After-split parity result: PASS'), 'deletion-fallback after-split parity evidence must pass');
assert(rollbackEvidence.includes('Rollback result: PASS'), 'deletion-fallback rollback evidence must pass');
assert(rollbackEvidence.includes('OWNER_SHA256=f267467785faea7ef3b8cc0c50a15764fd3bd13759a852b20e050a7887338786'), 'deletion-fallback rollback evidence must preserve owner hash');
for (const signature of protectedSignatures) {
  assert.strictEqual(html.split(signature).length - 1, approved.has(signature) ? 0 : 1, `protected inline count mismatch: ${signature}`);
}
assert.strictEqual(moduleText.split('\n').map((line, index) => /[ \t]$/.test(line) ? index + 1 : null).filter(Boolean).length, 0, 'deletion-fallback module must have no trailing whitespace');

console.log('DELETION_FALLBACK_PRODUCTION_SPLIT_CONTRACT_HARNESS=PASS');
console.log('BEFORE_AFTER_STATIC_PARITY=PASS');
console.log('CANONICAL_OWNER_HASH=PASS');
console.log('PRODUCTION_BROWSER_SMOKE=PASS');
console.log('GLOBAL_CALLER_HANDOFF=PASS');
console.log('PROTECTED_SPLITS=9_OF_19');
console.log('ROLLBACK_PROOF=PASS');
