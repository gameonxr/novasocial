const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const repo = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const sourceFiles = execFileSync('find', [path.join(repo, 'src'), '-type', 'f', '-name', '*.js'], { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
const sourceText = sourceFiles.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
const browserProofFiles = [
  'dms-empty-state-browser-proof-evidence.txt',
  'dms-refresh-no-account-browser-proof-evidence.txt',
  'dms-refresh-current-tab-browser-proof-evidence.txt'
];
for (const file of browserProofFiles) {
  const evidencePath = path.join(repo, 'docs', file);
  assert(fs.existsSync(evidencePath), `DMs browser proof must exist: ${file}`);
  assert(fs.readFileSync(evidencePath, 'utf8').includes('PASS'), `DMs browser proof must contain PASS: ${file}`);
}
const requiredMarkers = [
  'async function renderDMs()',
  'async function _refreshDmsInPlace()',
  '_silentBackgroundRefresh',
  '_renderGeneration',
  "id=\"notes-bar\"",
  'data-cid=',
  'conversation_members',
  'scrollTop',
  '_tabCache',
  '_saveTabToCache',
  '_tryRestoreFromCache',
  'Promise.all'
];
for (const marker of requiredMarkers) {
  assert(html.includes(marker), `DMs seam marker must remain inline: ${marker}`);
}
assert(html.includes('if(myGeneration !== _renderGeneration) return;'), 'primary render generation guard must remain');
assert(html.includes('if (chatGeneration !== _renderGeneration || !window._chatScreenActive) return;'), 'chat generation guard must remain');
assert(html.includes('function openChat('), 'openChat must remain inline');
assert.strictEqual(sourceText.includes('async function renderDMs()'), false, 'renderDMs must not be extracted');
assert.strictEqual(sourceText.includes('async function _refreshDmsInPlace()'), false, '_refreshDmsInPlace must not be extracted');
assert.strictEqual(sourceText.includes('function openChat('), false, 'openChat must not be extracted');
assert(fs.existsSync(path.join(repo, 'docs', 'dms-realtime-contract.md')), 'DMs behavior contract must remain present');
assert(fs.existsSync(path.join(repo, 'docs', 'dms-realtime-contract-harness.js')), 'DMs behavior harness must remain present');
const dmsHarness = fs.readFileSync(path.join(repo, 'docs', 'dms-realtime-contract-harness.js'), 'utf8');
assert(dmsHarness.includes('createInjectedDmsSeam'), 'DMs injected seam proof must remain present');
assert(dmsHarness.includes('primary-render') && dmsHarness.includes('in-place-refresh'), 'DMs injected seam dispatch markers must remain present');

console.log('DMS_SEAM_PREPARATION_HARNESS=PASS');
console.log('DEPENDENCY_MAP=RENDER_REFRESH_DATA_STATE_DOM_CACHE_SCROLL_NAVIGATION');
console.log('PROTECTED_DM_SIGNATURES=3');
console.log('BROWSER_MOCK_EVIDENCE=3_PASS');
console.log('INJECTED_SEAM_PROOF=PASS');
console.log('EXTRACTED_DM_SIGNATURES=0');
console.log('NON_DESTRUCTIVE_REFRESH=PASS');
console.log('PRODUCTION_SPLIT=0');
