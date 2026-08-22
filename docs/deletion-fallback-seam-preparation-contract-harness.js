const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const repo = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const sourceFiles = execFileSync('find', [path.join(repo, 'src'), '-type', 'f', '-name', '*.js'], { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
const sourceText = sourceFiles.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
const browserProofFiles = [
  'deletion-fallback-browser-proof-evidence.txt',
  'deletion-fallback-valid-queue-browser-proof-evidence.txt',
  'deletion-fallback-empty-queue-browser-proof-evidence.txt',
  'deletion-fallback-browser-comparison-proof-evidence.txt'
];
for (const file of browserProofFiles) {
  const evidencePath = path.join(repo, 'docs', file);
  assert(fs.existsSync(evidencePath), `Deletion fallback browser proof must exist: ${file}`);
  assert(fs.readFileSync(evidencePath, 'utf8').includes('PASS'), `Deletion fallback browser proof must contain PASS: ${file}`);
}
const requiredHtmlMarkers = [
  'async function syncLocalDeletionFallback()',
  '_mediaDeleteFallback',
  'localStorage.getItem',
  'JSON.parse',
  'deleteMediaProduction(item.mediaUrl, item.source, item.reason)',
  'localStorage.removeItem',
  'catch(e)',
  "typeof syncLocalDeletionFallback === 'function'"
];
for (const marker of requiredHtmlMarkers) {
  assert(html.includes(marker), `Deletion fallback seam marker must remain inline: ${marker}`);
}
assert(fs.existsSync(path.join(repo, 'docs', 'local-deletion-fallback-contract.md')), 'Deletion fallback behavior contract must remain present');
assert(fs.existsSync(path.join(repo, 'docs', 'local-deletion-fallback-contract-harness.js')), 'Deletion fallback behavior harness must remain present');
assert.strictEqual(sourceText.includes('async function syncLocalDeletionFallback()'), false, 'syncLocalDeletionFallback must not be extracted');
assert.strictEqual(sourceText.includes('async function deleteMediaProduction('), false, 'deleteMediaProduction must not be extracted');
assert(html.includes('for(const item of pending)'), 'Fallback replay must retain ordered item iteration');
assert(html.includes('try {\n        await deleteMediaProduction') || html.includes('try{\n        await deleteMediaProduction') || html.includes('try{await deleteMediaProduction'), 'Fallback replay must retain per-item isolation');
assert(html.includes('localStorage.removeItem(\'_mediaDeleteFallback\')') || html.includes('localStorage.removeItem("_mediaDeleteFallback")'), 'Fallback queue must retain post-loop finalization');
assert(html.includes('syncLocalDeletionFallback().catch(() => {})'), 'Startup must retain non-throwing fallback guard');

console.log('DELETION_FALLBACK_SEAM_PREPARATION_HARNESS=PASS');
console.log('DEPENDENCY_MAP=QUEUE_READ_ORDERED_REPLAY_ITEM_ISOLATION_FINALIZATION_MEDIA_STARTUP');
console.log('PROTECTED_DELETION_SIGNATURES=2');
console.log('BROWSER_MOCK_EVIDENCE=4_PASS');
console.log('EXTRACTED_PROTECTED_DELETION_SIGNATURES=0');
console.log('PRODUCTION_SPLIT=0');
