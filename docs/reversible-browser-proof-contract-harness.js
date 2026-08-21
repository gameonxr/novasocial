const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const repo = path.resolve(__dirname, '..');
const docsDir = path.join(repo, 'docs');
const matrix = fs.readFileSync(path.join(docsDir, 'high-risk-seam-readiness-matrix-contract.md'), 'utf8');
const gate = fs.readFileSync(path.join(docsDir, 'high-risk-extraction-gate-contract.md'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const sourceFiles = execFileSync('find', [path.join(repo, 'src'), '-type', 'f', '-name', '*.js'], { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
const source = sourceFiles.map(file => fs.readFileSync(file, 'utf8')).join('\n');

assert(matrix.includes('Reversible browser proof | Contract and harness are present; browser proof is not yet established for a protected split'), 'matrix must continue to mark browser proof as remaining');
assert(matrix.includes('Protected production splits | 0/19 signatures moved'), 'matrix must continue to report zero protected production splits');
assert(gate.includes('Direct extraction is explicitly blocked until adapter and proof work passes'), 'direct extraction gate must remain blocked');

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
  'reversible-browser-proof-contract.md'
]) {
  assert(fs.existsSync(path.join(docsDir, file)), `required seam/proof contract missing: ${file}`);
}
for (const file of [
  'dms-seam-preparation-contract-harness.js',
  'reels-seam-preparation-contract-harness.js',
  'calls-webrtc-seam-preparation-contract-harness.js',
  'stories-seam-preparation-contract-harness.js',
  'notes-seam-preparation-contract-harness.js',
  'voice-recording-seam-preparation-contract-harness.js',
  'deletion-fallback-seam-preparation-contract-harness.js',
  'particle-seam-preparation-contract-harness.js',
  'push-seam-preparation-contract-harness.js',
  'reversible-browser-proof-contract-harness.js'
]) {
  assert(fs.existsSync(path.join(docsDir, file)), `required seam/proof harness missing: ${file}`);
}

assert(fs.existsSync(path.join(docsDir, 'particle-browser-proof-evidence.txt')), 'particle browser-proof evidence must remain present');
assert(fs.readFileSync(path.join(docsDir, 'particle-browser-proof-evidence.txt'), 'utf8').includes('NON_DESTRUCTIVE_PARTICLE_BROWSER_MOCK=PASS'), 'particle browser mock evidence must remain PASS');

for (const signature of [
  'async function renderDMs()',
  'async function renderReels()',
  'function createPeerConnection(callId, remoteUserId) {',
  'function openSV(startIdx){',
  'function spawnLikeParticles(el){',
  'async function toggleRecording(cid)',
  'async function enablePushFromSettings()',
  'async function resetPushFromSettings()',
  'async function submitNote()',
  'async function deleteMyNote()',
  'function renderStoryElements()',
  'async function syncLocalDeletionFallback()'
]) {
  assert.strictEqual((html.match(new RegExp(signature.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length, 1, `protected owner must remain exactly once inline: ${signature}`);
  assert(!source.includes(signature), `protected owner must remain outside src: ${signature}`);
}

assert(!source.includes('reversibleBrowserProofPassed'), 'no speculative browser-proof pass flag may be introduced');
assert(!source.includes('productionSplitApproved'), 'no speculative production-split approval flag may be introduced');

console.log('REVERSIBLE_BROWSER_PROOF_CONTRACT_HARNESS=PASS');
console.log('PROOF_STATUS=REMAINING');
console.log('PROTECTED_SPLITS=0_OF_19');
console.log('DIRECT_EXTRACTION=BLOCKED_UNTIL_SEAM_PROOF');
console.log('PRODUCTION_CHANGE=0');
