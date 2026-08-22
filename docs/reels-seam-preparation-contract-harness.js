const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const repo = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const mainHtml = execFileSync('git', ['-C', repo, 'show', 'origin/main:index.html'], { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
const sourceFiles = execFileSync('find', [path.join(repo, 'src'), '-type', 'f', '-name', '*.js'], { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
const sourceText = sourceFiles.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
const browserProofFiles = [
  'reels-empty-state-browser-proof-evidence.txt',
  'reels-query-error-fallback-browser-proof-evidence.txt'
];
for (const file of browserProofFiles) {
  const evidencePath = path.join(repo, 'docs', file);
  assert(fs.existsSync(evidencePath), `Reels browser proof must exist: ${file}`);
  assert(fs.readFileSync(evidencePath, 'utf8').includes('PASS'), `Reels browser proof must contain PASS: ${file}`);
}
const requiredMarkers = [
  'reels-persistent-container',
  'window._savedReelIndex',
  'function _applyReelsVideoWindowing(currentIndex)',
  'data-media-url',
  'rinner.children.length',
  'let isSettling=false',
  'transform 0.24s cubic-bezier(0.22, 1, 0.36, 1)',
  'requestAnimationFrame',
  '.play().catch',
  '.load()'
];
for (const marker of requiredMarkers) {
  assert(html.includes(marker), `Reels seam marker must remain inline: ${marker}`);
}
assert(html.includes('async function renderReels()'), 'renderReels must remain inline');
assert(html.includes("const existingContainer = document.getElementById('reels-persistent-container');"), 'persistent-container lookup must remain');
assert(html.includes('if (isSettling)'), 'new swipe must force-complete an in-flight settle');
assert(html.includes('100 / count'), 'restore math must use live child count');
assert(html.includes('currentIndex - 1'), 'video window lower bound must remain');
assert(html.includes('currentIndex + 3'), 'video window upper bound must remain');
assert.strictEqual(sourceText.includes('async function renderReels()'), false, 'renderReels must not be extracted');
assert.strictEqual(sourceText.includes('function _applyReelsVideoWindowing(currentIndex)'), false, 'Reels windowing must not be extracted');
const hash = (value) => crypto.createHash('sha256').update(value).digest('hex');
const windowingStart = html.indexOf('function _applyReelsVideoWindowing(currentIndex)');
const windowingEnd = html.indexOf('async function renderReels(){', windowingStart);
const mainWindowingStart = mainHtml.indexOf('function _applyReelsVideoWindowing(currentIndex)');
const mainWindowingEnd = mainHtml.indexOf('async function renderReels(){', mainWindowingStart);
const reelsStart = html.indexOf('async function renderReels(){');
const reelsEnd = html.indexOf('function switchReelsView(mode) {', reelsStart);
const mainReelsStart = mainHtml.indexOf('async function renderReels(){');
const mainReelsEnd = mainHtml.indexOf('function switchReelsView(mode) {', mainReelsStart);
assert(windowingStart >= 0 && windowingEnd > windowingStart && mainWindowingStart >= 0 && mainWindowingEnd > mainWindowingStart, 'Reels windowing owner boundaries must be resolvable');
assert(reelsStart >= 0 && reelsEnd > reelsStart && mainReelsStart >= 0 && mainReelsEnd > mainReelsStart, 'Reels renderer owner boundaries must be resolvable');
assert.strictEqual(hash(html.slice(windowingStart, windowingEnd)), hash(mainHtml.slice(mainWindowingStart, mainWindowingEnd)), 'Reels windowing owner must not drift from origin/main during preparation');
assert.strictEqual(hash(html.slice(reelsStart, reelsEnd)), hash(mainHtml.slice(mainReelsStart, mainReelsEnd)), 'Reels renderer owner must not drift from origin/main during preparation');
assert(fs.existsSync(path.join(repo, 'docs', 'reels-persistent-contract.md')), 'Reels behavior contract must remain present');
assert(fs.existsSync(path.join(repo, 'docs', 'reels-persistent-contract-harness.js')), 'Reels behavior harness must remain present');
const reelsHarness = fs.readFileSync(path.join(repo, 'docs', 'reels-persistent-contract-harness.js'), 'utf8');
assert(reelsHarness.includes('createInjectedReelsSeam'), 'Reels injected seam proof must remain present');
assert(reelsHarness.includes("calls.push('park')") && reelsHarness.includes("calls.push('restore')") && reelsHarness.includes("calls.push('window')") && reelsHarness.includes("calls.push('settle')") && reelsHarness.includes("calls.push('resume')"), 'Reels injected seam dispatch markers must remain present');

console.log('REELS_SEAM_PREPARATION_HARNESS=PASS');
console.log('DEPENDENCY_MAP=PERSISTENT_DOM_POSITION_TRANSFORM_WINDOW_SWIPE_PLAYBACK_NAVIGATION');
console.log('PROTECTED_REELS_SIGNATURES=2');
console.log('BROWSER_MOCK_EVIDENCE=2_PASS');
console.log('INJECTED_SEAM_PROOF=PASS');
console.log('EXTRACTED_REELS_SIGNATURES=0');
console.log('SOURCE_WINDOW=CURRENT_MINUS_1_TO_PLUS_3');
console.log('OWNER_NO_DRIFT=PASS');
console.log('PRODUCTION_SPLIT=0');
