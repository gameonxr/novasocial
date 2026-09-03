const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const repo = process.env.NOVASOCIAL_REPO || path.resolve(__dirname, "..");
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
const protectedDossierContracts = [
  'dm-chat-realtime-protected-readiness-contract.md',
  'reels-renderer-navigation-protected-readiness-contract.md',
  'calls-webrtc-group-calls-protected-readiness-contract.md',
  'stories-lifecycle-editor-viewer-protected-readiness-contract.md',
  'voice-recording-delivery-protected-readiness-contract.md',
  'push-permission-resubscribe-protected-readiness-contract.md',
  'notes-submission-reactions-protected-readiness-contract.md',
  'account-bootstrap-security-protected-readiness-contract.md',
  'creation-upload-media-deletion-protected-readiness-contract.md',
  'moderation-admin-protected-readiness-contract.md'
];

const branch = execFileSync('git', ['-C', repo, 'branch', '--show-current'], { encoding: 'utf8' }).trim();
const status = execFileSync('git', ['-C', repo, 'status', '--porcelain'], { encoding: 'utf8' });
const head = execFileSync('git', ['-C', repo, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const remoteBranch = execFileSync('git', ['-C', repo, 'rev-parse', 'refs/remotes/origin/Branch2'], { encoding: 'utf8' }).trim();
const remoteMain = execFileSync('git', ['-C', repo, 'rev-parse', 'refs/remotes/origin/main'], { encoding: 'utf8' }).trim();

assert.strictEqual(branch, 'Branch2', 'current branch must be Branch2');
assert.strictEqual(status, '', 'worktree must be clean after publication');
assert.strictEqual(head, remoteBranch, 'local HEAD must match origin/Branch2');
assert.strictEqual(remoteMain, 'ef418007c9b9a797488b4825be5f0c807da22369', 'origin/main must remain the protected untouched ref');
for (const file of protectedDossierContracts) {
  const dossier = fs.readFileSync(path.join(docsDir, file), 'utf8');
  assert(dossier.includes('PREPARATION_ONLY'), `${file} must remain preparation-only`);
  assert(dossier.includes('PRODUCTION_DECISION=BLOCKED'), `${file} must remain production-blocked`);
  assert(dossier.includes('EXPLICIT_FEATURE_AUTHORIZATION=REQUIRED'), `${file} must require explicit authorization`);
}

assert.strictEqual(jsFiles.length, 236, '236 extracted JavaScript modules must remain after the cleanup-expired-stories extraction');
assert.strictEqual(cssFiles.length, 18, '18 extracted CSS stylesheets must remain');
assert.strictEqual(featureFiles.length, 225, '225 feature modules must remain after the cleanup-expired-stories extraction');
assert.strictEqual((html.match(/<script\b/gi) || []).length, 238, 'HTML must retain 238 script tags after the cleanup-expired-stories extraction');
assert.strictEqual((html.match(/<\/script>/gi) || []).length, 238, 'HTML script tags must remain balanced');
assert.strictEqual((html.match(/<script\s+src=/gi) || []).length, 237, 'HTML must retain 237 external script tags after the cleanup-expired-stories extraction');

const inlineStart = html.indexOf('\n<script>\n');
assert(inlineStart >= 0, 'inline application script boundary must remain');
for (const script of ['src/features/jump-to-message-owner.js', 'src/features/smart-ranking.js', 'src/features/nova-init.js', 'src/features/like-effects.js']) {
  assert(html.indexOf(script) > inlineStart, `${script} must remain after inline application code`);
}
assert(html.indexOf('src/features/jump-to-message-owner.js') < html.indexOf('src/features/smart-ranking.js'), 'jump-to-message owner must precede the post-inline owner tail');
assert(html.indexOf('src/features/smart-ranking.js') < html.indexOf('src/features/nova-init.js'), 'smart-ranking must precede nova-init');
assert(html.indexOf('src/features/nova-init.js') < html.indexOf('src/features/spawn-like-particles.js'), 'nova-init must precede spawn-like-particles');
assert(html.indexOf('src/features/spawn-like-particles.js') < html.indexOf('src/features/sync-local-deletion-fallback.js'), 'spawn-like-particles must precede sync-local-deletion-fallback');
assert(html.indexOf('src/features/sync-local-deletion-fallback.js') < html.indexOf('src/features/push-settings.js'), 'sync-local-deletion-fallback must precede push-settings');
assert(html.indexOf('src/features/push-settings.js') < html.indexOf('src/features/admin-appeals-filter-owner.js'), 'push-settings must precede admin-appeals-filter-owner');
assert(html.indexOf('src/features/admin-appeals-filter-owner.js') < html.indexOf('src/features/note-reactors-list-owner.js'), 'admin-appeals-filter-owner must precede note-reactors-list-owner');
assert(html.lastIndexOf('src/features/note-reactors-list-owner.js') < html.lastIndexOf('src/features/note-viewer-owners.js'), 'note-reactors-list-owner must precede note-viewer-owners');
assert(html.lastIndexOf('src/features/note-viewer-owners.js') < html.lastIndexOf('src/features/note-deletion-owner.js'), 'note-viewer-owners must precede note-deletion-owner');
assert(html.lastIndexOf('src/features/note-deletion-owner.js') < html.lastIndexOf('src/features/story-editor-owners.js'), 'note-deletion-owner must precede story-editor-owners');
assert(html.lastIndexOf('src/features/story-editor-owners.js') < html.lastIndexOf('src/features/like-effects.js'), 'story-editor-owners must precede like-effects');
assert(html.includes('src/features/push-settings.js'), 'push-settings module must remain referenced');
assert(html.includes('src/features/admin-appeals-filter-owner.js'), 'admin-appeals-filter-owner module must remain referenced');
assert(html.includes('src/features/note-viewer-owners.js'), 'note-viewer-owners module must remain referenced');
assert(html.includes('src/features/note-deletion-owner.js'), 'note-deletion-owner module must remain referenced');

for (const marker of [
  'async function enablePushFromSettings()',
  'async function resetPushFromSettings()',
  'async function viewNote(noteId){',
  'async function deleteMyNote()',
  'async function removeMyNoteFromViewer(noteId){',
  'async function renderReels()',
  'function createPeerConnection(callId, remoteUserId) {',
  'function openSV(startIdx){',
  'async function syncLocalDeletionFallback()',
  'async function toggleRecording(cid)',
  'async function enablePushFromSettings()',
  'async function resetPushFromSettings()',
  'async function submitNote()',
  'function submitNativeEmojiReaction(',
  'function reactToNote(',
  'async function loadNoteReactorsList(',
  'function renderStoryElements()',
  'async function voteStoryPoll(',
  'async function refreshPollResults(',
  'async function loadStoryPollState(',
]) {
  const approved = marker === 'function spawnLikeParticles(el){' || marker === 'async function syncLocalDeletionFallback()' || marker === 'async function enablePushFromSettings()' || marker === 'async function resetPushFromSettings()' || marker === 'async function viewNote(noteId){' || marker === 'async function removeMyNoteFromViewer(noteId){' || marker === 'async function deleteMyNote()' || marker === 'function renderStoryElements()' || marker === 'async function loadNoteReactorsList(' || marker === 'function reactToNote(' || marker === 'async function renderReels()' || marker === 'function silentPushResubscribeIfGranted()' || marker === 'async function submitNote()';
  assert.strictEqual(html.split(marker).length - 1, approved ? 0 : 1, `protected inline marker count mismatch: ${marker}`);
}
const particleModule = fs.readFileSync(path.join(repo, 'src', 'features', 'spawn-like-particles.js'), 'utf8');
const deletionModule = fs.readFileSync(path.join(repo, 'src', 'features', 'sync-local-deletion-fallback.js'), 'utf8');
const pushModule = fs.readFileSync(path.join(repo, 'src', 'features', 'push-settings.js'), 'utf8');
const noteModule = fs.readFileSync(path.join(repo, 'src', 'features', 'note-viewer-owners.js'), 'utf8');
const noteDeletionModule = fs.readFileSync(path.join(repo, 'src', 'features', 'note-deletion-owner.js'), 'utf8');
assert(!html.includes('function spawnLikeParticles(el){'), 'approved particle owner must be absent from inline HTML');
assert(!html.includes('async function syncLocalDeletionFallback()'), 'approved deletion-fallback owner must be absent from inline HTML');
assert(!html.includes('async function enablePushFromSettings()'), 'approved Push enable owner must be absent from inline HTML');
assert(!html.includes('async function resetPushFromSettings()'), 'approved Push reset owner must be absent from inline HTML');
assert(particleModule.includes('window.spawnLikeParticles = function(el){'), 'approved particle module must expose the global owner');
assert.strictEqual((particleModule.match(/window\.spawnLikeParticles\s*=\s*function\(el\)\{/g) || []).length, 1, 'approved particle module must have one owner');
assert(deletionModule.includes('window.syncLocalDeletionFallback = async function() {'), 'approved deletion-fallback module must expose the global owner');
assert.strictEqual((deletionModule.match(/window\.syncLocalDeletionFallback\s*=\s*async function\(\)\s*\{/g) || []).length, 1, 'approved deletion-fallback module must have one owner');
assert.strictEqual((pushModule.match(/window\.enablePushFromSettings\s*=\s*async function\(/g) || []).length, 1, 'approved Push enable module must have one owner');
assert.strictEqual((pushModule.match(/window\.resetPushFromSettings\s*=\s*async function\(/g) || []).length, 1, 'approved Push reset module must have one owner');
assert.strictEqual((noteModule.match(/window\.viewNote\s*=\s*async function\(/g) || []).length, 1, 'approved Note view module must have one owner');
assert.strictEqual((noteModule.match(/window\.removeMyNoteFromViewer\s*=\s*async function\(/g) || []).length, 1, 'approved Note removal module must have one owner');
assert.strictEqual((noteDeletionModule.match(/window\.deleteMyNote\s*=\s*async function\(/g) || []).length, 1, 'approved Note deletion module must have one owner');

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
assert.deepStrictEqual(unresolved, [], 'all inline handler targets must resolve after the authorized forwardMessage implementation');
assert(/(?:async\s+)?function\s+forwardMessage\s*\(/.test(html), 'authorized forwardMessage implementation must remain inline');
assert(/(?:async\s+)?function\s+completeForwardMessage\s*\(/.test(html), 'authorized completeForwardMessage helper must remain inline');
assert.strictEqual(allDocs.length, 338, '338 documentation Markdown files must be published after the Push force-resubscribe production split');
assert.strictEqual(allHarnesses.length, 322, '321 harness files must be published after the Push force-resubscribe owner production split');
assert.strictEqual(contractFiles.length, 318, '317 standard contract documents must be published after the Push force-resubscribe production split contract');
assert.strictEqual(harnessFiles.length, 317, '316 standard contract harnesses must be published after the Push force-resubscribe production split proof package');
assert.deepStrictEqual(allDocs.filter(file => !file.endsWith('-contract.md')).sort(), ['blocking-contract-assessment.md', 'browser-smoke-baseline-2026-08-22.md', 'notes-reaction-owner-independent-authorization-addendum.md', 'notes-reaction-owner-production-authorization-addendum.md', 'notes-submission-owner-dependency-map.md', 'notes-submission-owner-independent-authorization-addendum.md', 'notes-submission-owner-production-authorization-addendum.md', 'protected-contract-coverage.md', 'push-force-resubscribe-owner-dependency-map.md', 'push-force-resubscribe-owner-independent-authorization-addendum.md', 'push-force-resubscribe-owner-production-authorization-addendum.md', 'push-permission-banner-owner-independent-authorization-addendum.md', 'push-permission-banner-owner-production-authorization-addendum.md', 'push-silent-resubscribe-owner-independent-authorization-addendum.md', 'push-silent-resubscribe-owner-production-authorization-addendum.md', 'push-subscription-owner-dependency-map.md', 'push-subscription-owner-independent-authorization-addendum.md', 'push-subscription-owner-production-authorization-addendum.md', 'reels-renderer-navigation-independent-authorization-addendum.md', 'reels-renderer-navigation-production-authorization-addendum.md'], 'nonstandard documentation exceptions must remain explicitly mapped');
assert.deepStrictEqual(allHarnesses.filter(file => !file.endsWith('-contract-harness.js')).sort(), ['account-bootstrap-adapter-harness.js', 'logout-account-transition-harness.js', 'note-deletion-browser-parity-harness.js', 'protected-contract-coverage-harness.js', 'story-editor-browser-parity-harness.js'], 'legacy harness exceptions must remain mapped');
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
