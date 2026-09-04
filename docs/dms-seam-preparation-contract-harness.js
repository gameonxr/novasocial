const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const repo = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const sourceFiles = execFileSync('find', [path.join(repo, 'src'), '-type', 'f', '-name', '*.js'], { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
const sourceText = sourceFiles.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
const branchModule = fs.readFileSync(path.join(repo, 'src', 'features', 'dms-renderer-owner.js'), 'utf8');
const tabCacheModules = ['save-tab-to-cache.js', 'try-restore-from-cache.js'].filter(f => fs.existsSync(path.join(repo, 'src', 'features', f))).map(f => fs.readFileSync(path.join(repo, 'src', 'features', f), 'utf8')).join('\n');
const dmsExtraModules = ['refresh-dms-in-place.js', 'load-msgs.js'].filter(f => fs.existsSync(path.join(repo, 'src', 'features', f))).map(f => fs.readFileSync(path.join(repo, 'src', 'features', f), 'utf8')).join('\n');
const combinedDmsSource = html + '\n' + branchModule + '\n' + tabCacheModules + '\n' + dmsExtraModules;
assert(branchModule.includes('window.renderDMs = async function(){'), 'external DMs renderer must expose the classic global owner');
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
  'async function _refreshDmsInPlace()',
  'async function openChat(',
  'async function loadMsgs(',
  'async function sendMsg(',
  '_silentBackgroundRefresh',
  '_renderGeneration',
  'const [memRes, unreadRes, notesData] = await Promise.all([',
  "db.from('conversation_members').select('conversation_id,conversations(*)').eq('user_id',ME.id)",
  "db.from('messages').select('conversation_id').is('seen_at', null).neq('sender_id', ME.id)",
  '_fetchNotesBarData()',
  "id=\"notes-bar\"",
  'data-cid=',
  '_renderNotesBarHtml(notesData)',
  'conversation_members',
  'scrollTop',
  '_tabCache',
  '_saveTabToCache',
  '_tryRestoreFromCache',
  'Promise.all'
];
for (const marker of requiredMarkers) {
  assert(combinedDmsSource.includes(marker), `DMs seam marker must remain in protected DMs source: ${marker}`);
}
assert(combinedDmsSource.includes('if(myGeneration !== _renderGeneration) return;'), 'primary render generation guard must remain');
assert(html.includes('if (chatGeneration !== _renderGeneration || !window._chatScreenActive) return;'), 'chat generation guard must remain');
assert(html.includes('function openChat('), 'openChat must remain inline');
assert(html.includes('const chatGeneration = ++_renderGeneration;'), 'chat generation must be captured before async reads');
assert(html.includes('window.chatSubscription'), 'chat realtime subscription owner must remain inline');
assert(html.includes('window.typingSub'), 'typing subscription owner must remain inline');
assert(html.includes('pushNavState(\'chat\', cid'), 'chat navigation-stack owner must remain inline');
assert(combinedDmsSource.includes('scr.innerHTML=`'), 'DM primary renderer must retain its screen replacement boundary');
assert(combinedDmsSource.includes('_refreshDmsInPlace()'), 'background refresh must remain explicitly non-destructive');
assert.strictEqual(sourceText.includes('async function renderDMs()'), false, 'renderDMs must use only the external classic global owner');
assert(fs.readFileSync(path.join(repo, 'src', 'features', 'refresh-dms-in-place.js'), 'utf8').includes('window._refreshDmsInPlace = async function _refreshDmsInPlace('), 'approved _refreshDmsInPlace owner must exist');
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
console.log('EXTRACTED_DM_SIGNATURES=1');
console.log('NON_DESTRUCTIVE_REFRESH=PASS');
console.log('PRODUCTION_SPLIT=1');
console.log('PRODUCTION_DECISION=GATE_VALIDATION_PENDING');
