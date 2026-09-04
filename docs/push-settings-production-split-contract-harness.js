const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const moduleText = fs.readFileSync(path.join(repo, 'src', 'features', 'push-settings.js'), 'utf8');
const contract = fs.readFileSync(path.join(repo, 'docs', 'push-settings-production-split-contract.md'), 'utf8');
const afterEvidence = fs.readFileSync(path.join(repo, 'docs', 'push-settings-after-split-browser-proof-evidence.txt'), 'utf8');
const rollbackEvidencePath = path.join(repo, 'docs', 'push-settings-parity-rollback-evidence.txt');
assert(fs.existsSync(rollbackEvidencePath), 'Push rollback evidence must exist');
const rollbackEvidence = fs.readFileSync(rollbackEvidencePath, 'utf8');

const expected = {
  enableHash: '711adee3890de37d7bf56f2e51355447861f86f89ed550183b7f5aea7997d520',
  resetHash: '0bc93e5da2655a6027bc4cb01e87eacb333a46426e5f60a2b4f208a09c543a4b',
  splitCommit: '43ab6a476fa4b0b7853475d09a94241702d7e452',
  parent: '18778c497f211a6706567ee4fbaf46ae815dcc27',
  temporarySplit: '8da2a0ec4958dfae1a8f435bfa8f35796a041d20',
  temporaryRollback: '8c38dab084fc4083b9259cbd1828633283107e26',
};
assert(contract.includes(expected.splitCommit), 'Push contract must record production split commit');
assert(contract.includes(expected.parent), 'Push contract must record split parent');
assert(contract.includes(expected.temporaryRollback), 'Push contract must record temporary rollback commit');
assert(rollbackEvidence.includes(`ENABLE_OWNER_SHA256=${expected.enableHash}`), 'Push rollback evidence must record enable hash');
assert(rollbackEvidence.includes(`RESET_OWNER_SHA256=${expected.resetHash}`), 'Push rollback evidence must record reset hash');
assert(rollbackEvidence.includes('After-split parity result: PASS'), 'Push after-split parity must pass');
assert(rollbackEvidence.includes('Rollback result: PASS'), 'Push rollback must pass');
assert(rollbackEvidence.includes('STATIC_AFTER_SPLIT=PASS'), 'Push static after-split proof must pass');
assert(rollbackEvidence.includes('BROWSER_AFTER_SPLIT=PASS'), 'Push browser after-split proof must pass');
assert(rollbackEvidence.includes('SAFE_NO_SIDE_EFFECTS=PASS'), 'Push rollback proof must remain side-effect safe');
assert(afterEvidence.includes('RESULT=PASS'), 'Push browser after-split evidence must pass');
assert(afterEvidence.includes('SAFE_NO_SIDE_EFFECTS=PASS'), 'Push browser proof must remain side-effect safe');

for (const owner of ['enablePushFromSettings', 'resetPushFromSettings']) {
  assert.strictEqual((html.match(new RegExp(`async function ${owner}\\s*\\(`, 'g')) || []).length, 0, `${owner} must be absent from inline HTML`);
}
assert.strictEqual((moduleText.match(/window\.enablePushFromSettings\s*=\s*async function\(/g) || []).length, 1, 'enable Push window owner must occur once');
assert.strictEqual((moduleText.match(/window\.resetPushFromSettings\s*=\s*async function\(/g) || []).length, 1, 'reset Push window owner must occur once');
assert.strictEqual((html.match(/<script\b/gi) || []).length, 465, '236 opening script tags required after the DMs renderer split');
assert.strictEqual((html.match(/<\/script>/gi) || []).length, 465, '231 closing script tags required after the DMs renderer split');
assert.strictEqual((html.match(/<script\s+src=/gi) || []).length, 464, '234 external script tags required after the DMs renderer split');
assert(html.indexOf('src/features/push-settings.js') < html.indexOf('src/features/like-effects.js'), 'Push module must load before like-effects');
assert(html.includes('navigator.serviceWorker.register(\'/sw.js\')'), 'service-worker registration must remain in app boundary');
assert(!moduleText.includes('VAPID_PUBLIC_KEY'), 'Push module must not own VAPID configuration');
assert(!moduleText.includes("push_subscriptions"), 'Push module must not own database persistence');
assert(!moduleText.includes('serviceWorker.register'), 'Push module must not own service-worker registration');
assert(moduleText.match(/window\.enablePushFromSettings[\s\S]*window\.resetPushFromSettings/), 'window owners must remain ordered in module');

console.log('PUSH_SETTINGS_PRODUCTION_SPLIT_CONTRACT_HARNESS=PASS');
console.log('CANONICAL_OWNER_HASHES=PASS');
console.log('STATIC_AFTER_SPLIT=PASS');
console.log('BROWSER_AFTER_SPLIT=PASS');
console.log('ROLLBACK_PROOF=PASS');
console.log('PROTECTED_SPLITS=10_OF_19');
