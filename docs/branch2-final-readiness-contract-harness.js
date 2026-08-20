const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const repo = '/home/ubuntu/novasocial';
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const manifest = JSON.parse(fs.readFileSync(path.join(repo, 'manifest.json'), 'utf8'));
const serviceWorker = fs.readFileSync(path.join(repo, 'sw.js'), 'utf8');
const srcDir = path.join(repo, 'src');
const docsDir = path.join(repo, 'docs');
const sourceFiles = execFileSync('find', [srcDir, '-type', 'f'], { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
const jsFiles = sourceFiles.filter(file => file.endsWith('.js'));
const cssFiles = sourceFiles.filter(file => file.endsWith('.css'));
const featureFiles = jsFiles.filter(file => file.includes(`${path.sep}features${path.sep}`));
const allDocs = fs.readdirSync(docsDir).filter(file => file.endsWith('.md'));
const allHarnesses = fs.readdirSync(docsDir).filter(file => file.endsWith('-harness.js'));
const contractFiles = allDocs.filter(file => file.endsWith('-contract.md'));
const harnessFiles = allHarnesses.filter(file => file.endsWith('-contract-harness.js'));
const mappedLegacyContracts = new Set(['account-bootstrap-contract.md', 'logout-account-transition-contract.md']);

const branch = execFileSync('git', ['-C', repo, 'branch', '--show-current'], { encoding: 'utf8' }).trim();
const status = execFileSync('git', ['-C', repo, 'status', '--porcelain'], { encoding: 'utf8' });
const head = execFileSync('git', ['-C', repo, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const remoteBranch = execFileSync('git', ['-C', repo, 'rev-parse', 'refs/remotes/origin/Branch2'], { encoding: 'utf8' }).trim();
const remoteMain = execFileSync('git', ['-C', repo, 'rev-parse', 'refs/remotes/origin/main'], { encoding: 'utf8' }).trim();

assert.strictEqual(branch, 'Branch2', 'current branch must be Branch2');
assert.strictEqual(status, '', 'worktree must be clean after publication');
assert.strictEqual(head, remoteBranch, 'local HEAD must match origin/Branch2');
assert.strictEqual(remoteMain, 'ef418007c9b9a797488b4825be5f0c807da22369', 'origin/main must remain the protected untouched ref');

assert.strictEqual(jsFiles.length, 211, '211 extracted JavaScript modules must remain');
assert.strictEqual(cssFiles.length, 18, '18 extracted CSS stylesheets must remain');
assert.strictEqual(featureFiles.length, 200, '200 feature modules must remain');
assert.strictEqual((html.match(/<script\b/gi) || []).length, 213, 'HTML must retain 213 script tags');
assert.strictEqual((html.match(/<\/script>/gi) || []).length, 213, 'HTML script tags must remain balanced');
assert.strictEqual((html.match(/<script\s+src=/gi) || []).length, 212, 'HTML must retain 212 external script tags');

const inlineStart = html.indexOf('\n<script>\n');
assert(inlineStart >= 0, 'inline application script boundary must remain');
for (const script of ['src/features/smart-ranking.js', 'src/features/nova-init.js', 'src/features/like-effects.js']) {
  assert(html.indexOf(script) > inlineStart, `${script} must remain after inline application code`);
}
assert(html.indexOf('src/features/smart-ranking.js') < html.indexOf('src/features/nova-init.js'), 'smart-ranking must precede nova-init');
assert(html.indexOf('src/features/nova-init.js') < html.indexOf('src/features/like-effects.js'), 'nova-init must precede like-effects');

for (const marker of [
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
  'async function loadStoryPollState(',
]) {
  assert(html.includes(marker), `protected inline marker missing: ${marker}`);
}

assert(fs.existsSync(path.join(repo, 'manifest.json')), 'manifest must remain present');
assert(fs.existsSync(path.join(repo, 'sw.js')), 'service worker must remain present');
assert(html.includes('href="/manifest.json"'), 'HTML must retain manifest link');
assert(html.includes("navigator.serviceWorker.register('/sw.js')"), 'HTML must retain service-worker registration');
assert.strictEqual(manifest.name, 'NovaSocial', 'manifest identity must remain NovaSocial');
assert(serviceWorker.includes("self.addEventListener('push'"), 'service worker push handler must remain');

const handlers = [...new Set([...html.matchAll(/onclick=["']\s*([A-Za-z_$][\w$]*)\s*\(/g)].map(match => match[1]))].sort();
const allSource = [html, ...jsFiles.map(file => fs.readFileSync(file, 'utf8'))].join('\n');
const unresolved = handlers.filter(name => {
  const declaration = new RegExp(`\\b(?:async\\s+)?function\\s+${name}\\s*\\(`);
  const assignment = new RegExp(`\\b(?:window\\.)?${name}\\s*=`);
  return !declaration.test(allSource) && !assignment.test(allSource);
});
assert.deepStrictEqual(unresolved, ['forwardMessage'], 'only the documented forwardMessage seam may remain unresolved');
assert.strictEqual(allDocs.length, 180, '180 documentation Markdown files must be published');
assert.strictEqual(allHarnesses.length, 180, '180 harness files must be published');
assert.strictEqual(contractFiles.length, 178, '178 standard contract documents must be published');
assert.strictEqual(harnessFiles.length, 177, '177 standard contract harnesses must be published');
assert.deepStrictEqual(allDocs.filter(file => !file.endsWith('-contract.md')).sort(), ['blocking-contract-assessment.md', 'protected-contract-coverage.md'], 'legacy contract document exceptions must remain mapped');
assert.deepStrictEqual(allHarnesses.filter(file => !file.endsWith('-contract-harness.js')).sort(), ['account-bootstrap-adapter-harness.js', 'logout-account-transition-harness.js', 'protected-contract-coverage-harness.js'], 'legacy harness exceptions must remain mapped');
for (const contract of contractFiles) {
  if (mappedLegacyContracts.has(contract)) continue;
  const stem = contract.replace(/-contract\.md$/, '');
  assert(harnessFiles.includes(`${stem}-contract-harness.js`), `contract/harness pair missing for ${contract}`);
}

console.log('BRANCH2_FINAL_READINESS_HARNESS=PASS');
console.log(`BRANCH2_HEAD=${head}`);
console.log(`SOURCE_JS=${jsFiles.length}`);
console.log(`SOURCE_CSS=${cssFiles.length}`);
console.log(`DOCUMENTS=${allDocs.length}`);
console.log(`HARNESS_FILES=${allHarnesses.length}`);
console.log(`STANDARD_CONTRACTS=${contractFiles.length}`);
console.log(`STANDARD_HARNESSES=${harnessFiles.length}`);
console.log(`UNRESOLVED_DOCUMENTED_SEAMS=${unresolved.length}`);
