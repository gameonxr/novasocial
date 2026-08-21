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
  'async function syncLocalDeletionFallback()'
];

assert.strictEqual(sourceFiles.length, 211, '211 extracted JavaScript modules must remain present');
for (const signature of protectedSignatures) {
  assert.strictEqual(html.split(signature).length - 1, 1, `protected signature must remain exactly once inline: ${signature}`);
  assert.strictEqual(sourceText.includes(signature), false, `protected signature must not be extracted: ${signature}`);
}
assert(gate.includes('DIRECT_EXTRACTION=BLOCKED_UNTIL_SEAM_PROOF'), 'global high-risk gate must remain blocked until seam proof');
assert(matrix.includes('particle seam-preparation artifacts present'), 'matrix must record particle seam preparation');
assert(matrix.includes('Contract and harness are present; browser proof is not yet established'), 'matrix must record browser proof as remaining');
assert(fs.existsSync(path.join(repo, 'docs', 'reversible-browser-proof-contract.md')), 'reversible browser proof contract must remain present');
assert(fs.existsSync(path.join(repo, 'docs', 'reversible-browser-proof-contract-harness.js')), 'reversible browser proof harness must remain present');
assert(fs.existsSync(path.join(repo, 'docs', 'account-bootstrap-contract.md')), 'account/bootstrap seam contract must remain present');
assert(fs.existsSync(path.join(repo, 'docs', 'account-bootstrap-adapter-harness.js')), 'account/bootstrap adapter harness must remain present');
assert(fs.existsSync(path.join(repo, 'docs', 'protected-inline-parity-contract-harness.js')), 'protected parity harness must remain present');

console.log('HIGH_RISK_SEAM_READINESS_MATRIX_HARNESS=PASS');
console.log('PROTECTED_SIGNATURES=19');
console.log('EXTRACTED_PROTECTED_SIGNATURES=0');
console.log('ADAPTER_REFERENCE=ACCOUNT_BOOTSTRAP');
console.log('REVERSIBLE_BROWSER_PROOF=REMAINING');
console.log('DIRECT_EXTRACTION=BLOCKED_UNTIL_SEAM_PROOF');
