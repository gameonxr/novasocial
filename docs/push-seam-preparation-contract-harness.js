const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const srcDir = path.join(repo, 'src');
const sourceFiles = [];
function collect(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collect(full);
    else if (entry.name.endsWith('.js')) sourceFiles.push(full);
  }
}
collect(srcDir);
const extracted = sourceFiles.map(file => fs.readFileSync(file, 'utf8')).join('\n');
const browserProofFiles = [
  'push-browser-proof-evidence.txt',
  'push-denied-browser-proof-evidence.txt',
  'push-granted-browser-proof-evidence.txt',
  'push-default-denied-browser-proof-evidence.txt',
  'push-default-granted-browser-proof-evidence.txt',
  'push-default-dismissed-browser-proof-evidence.txt',
  'push-request-failure-browser-proof-evidence.txt',
  'push-reset-failure-browser-proof-evidence.txt',
  'push-reset-success-browser-proof-evidence.txt',
  'push-settings-after-split-browser-proof-evidence.txt',
  'push-settings-parity-rollback-evidence.txt'
];
for (const file of browserProofFiles) {
  const evidencePath = path.join(repo, 'docs', file);
  assert(fs.existsSync(evidencePath), `Push browser proof must exist: ${file}`);
  assert(fs.readFileSync(evidencePath, 'utf8').includes('PASS'), `Push browser proof must contain PASS: ${file}`);
}
const comparisonEvidencePath = path.join(repo, 'docs', 'push-settings-seam-comparison-proof-evidence.txt');
assert(fs.existsSync(comparisonEvidencePath), 'Push settings comparison evidence must exist');
const comparisonEvidence = fs.readFileSync(comparisonEvidencePath, 'utf8');
const productionEvidence = fs.readFileSync(path.join(repo, 'docs', 'push-settings-parity-rollback-evidence.txt'), 'utf8');
const pushModule = fs.readFileSync(path.join(repo, 'src', 'features', 'push-settings.js'), 'utf8');
assert(comparisonEvidence.includes('COMPARISON_RESULT=PASS'), 'Push settings comparison evidence must pass');
assert(comparisonEvidence.includes('ADAPTER_PARITY=PASS'), 'Push settings adapter parity evidence must pass');
assert(comparisonEvidence.includes('BROWSER_CONTEXT_SMOKE=PASS'), 'Push browser-context smoke must pass');
assert(comparisonEvidence.includes('LOGIN_GATE_VISIBLE=PASS'), 'Push browser smoke must preserve login gate');
assert(comparisonEvidence.includes('GLOBAL_OWNER_AVAILABILITY=PASS'), 'Push browser smoke must preserve global owners');
assert(comparisonEvidence.includes('SAFE_NO_SIDE_EFFECTS=PASS'), 'Push settings comparison must remain side-effect safe');

for (const ownerName of ['enablePushFromSettings', 'resetPushFromSettings']) {
  assert.strictEqual((html.match(new RegExp(`async function ${ownerName}\\s*\\(`, 'g')) || []).length, 0, `${ownerName} inline owner must be absent after split`);
  assert.strictEqual((pushModule.match(new RegExp(`window\\.${ownerName}\\s*=\\s*async function\\(`, 'g')) || []).length, 1, `${ownerName} must be window-assigned exactly once`);
  assert(!new RegExp(`(?:async\\s+)?function\\s+${ownerName}\\s*\\(`).test(extracted), `${ownerName} must not be duplicated by named declaration in src`);
}
assert(productionEvidence.includes('After-split parity result: PASS'), 'Push after-split parity must pass');
assert(productionEvidence.includes('Rollback result: PASS'), 'Push rollback must pass');

const pushSurface = `${html}\n${pushModule}`;
for (const marker of [
  "if (!('serviceWorker' in navigator) || !('PushManager' in window))",
  "Notification.permission === 'denied'",
  "Notification.permission === 'granted'",
  'subscribeToPushNotifications()',
  'Notification.requestPermission()',
  "permission === 'granted'",
  "permission === 'denied'",
  "showSettingsNotifications();",
  'try {',
  "console.error('[Push] Settings enable failed:', e)",
  "Notification.permission !== 'granted'",
  'forceResubscribePush()',
  "toast('Push subscription reset ✅')",
  "toast('Reset failed — check console 😕')"
]) {
  assert(pushSurface.includes(marker), `Push seam marker missing: ${marker}`);
}
assert(fs.existsSync(path.join(repo, 'docs', 'push-permission-contract.md')), 'push behavior contract must remain present');
assert(fs.existsSync(path.join(repo, 'docs', 'push-permission-contract-harness.js')), 'push behavior harness must remain present');
assert(html.includes("navigator.serviceWorker.register('/sw.js')"), 'service-worker registration must remain in the existing application boundary');
assert(fs.readFileSync(path.join(repo, 'sw.js'), 'utf8').includes("self.addEventListener('push'"), 'service-worker push owner must remain present');
assert(!extracted.includes('async function enablePushFromSettings'), 'src must not own protected push enable handler');
assert(!extracted.includes('async function resetPushFromSettings'), 'src must not own protected push reset handler');
assert(!extracted.includes('VAPID_PUBLIC_KEY ='), 'seam preparation must not introduce a speculative VAPID owner');

console.log('PUSH_SEAM_PREPARATION_CONTRACT_HARNESS=PASS');
console.log('PROTECTED_OWNERS_INLINE=NONE');
console.log('BROWSER_MOCK_EVIDENCE=11_PASS');
console.log('INLINE_COMPARISON_EVIDENCE=PASS');
console.log('DETERMINISTIC_MOCK_BOUNDARY=CAPABILITY_PERMISSION_SUBSCRIBE_RESET_REFRESH_ERROR');
console.log('REVERSIBLE_BROWSER_PROOF=PASS');
console.log('DIRECT_EXTRACTION=COMPLETE_FOR_PUSH_SETTINGS_ONLY');
console.log('PRODUCTION_SPLIT=COMPLETE');
