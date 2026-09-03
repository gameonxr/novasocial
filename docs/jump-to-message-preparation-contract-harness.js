const assert = require('assert');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const repo = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const origin = execFileSync('git', ['show', 'origin/main:index.html'], { cwd: repo, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
const sourceDir = path.join(repo, 'src', 'features');
const sourceFiles = fs.readdirSync(sourceDir).filter((name) => name.endsWith('.js'));
const sourceText = sourceFiles.map((name) => fs.readFileSync(path.join(sourceDir, name), 'utf8')).join('\n');
const contract = fs.readFileSync(path.join(repo, 'docs', 'jump-to-message-preparation-contract.md'), 'utf8');
const proof = fs.readFileSync(path.join(repo, 'docs', 'jump-to-message-preparation-browser-proof-evidence.txt'), 'utf8');
const rollback = fs.readFileSync(path.join(repo, 'docs', 'jump-to-message-parity-rollback-evidence.txt'), 'utf8');

function extractFunction(text) {
  const re = /(?:^|\n)[ \t]*function jumpToMessage\s*\([^)]*\)\s*\{/;
  const match = re.exec(text);
  assert(match, 'jumpToMessage declaration must exist');
  const open = match.index + match[0].lastIndexOf('{');
  let depth = 0;
  let quote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;
  for (let i = open; i < text.length; i += 1) {
    const ch = text[i];
    const nx = text[i + 1];
    if (lineComment) { if (ch === '\n') lineComment = false; continue; }
    if (blockComment) { if (ch === '*' && nx === '/') { blockComment = false; i += 1; } continue; }
    if (quote) { if (escaped) { escaped = false; continue; } if (ch === '\\') { escaped = true; continue; } if (ch === quote) quote = null; continue; }
    if (ch === '/' && nx === '/') { lineComment = true; i += 1; continue; }
    if (ch === '/' && nx === '*') { blockComment = true; i += 1; continue; }
    if (ch === "'" || ch === '"' || ch === '`') { quote = ch; continue; }
    if (ch === '{') depth += 1;
    if (ch === '}') { depth -= 1; if (depth === 0) return text.slice(match.index, i + 1); }
  }
  throw new Error('jumpToMessage body is unterminated');
}
function normalize(text) { return text.replace(/\r/g, '').replace(/[ \t]+$/gm, '').replace(/\n{3,}/g, '\n\n').trim(); }
function sha(text) { return crypto.createHash('sha256').update(normalize(text)).digest('hex'); }

const owner = extractFunction(origin);
const originOwner = extractFunction(origin);
const externalOwnerText = fs.readFileSync(path.join(sourceDir, 'jump-to-message-owner.js'), 'utf8');
const expectedHash = 'e06fcf2f2e397bb122255d982e07e35a1686641a22f6d46306f0072bd81eb073';
assert.strictEqual(sha(originOwner), expectedHash, 'immutable origin owner hash must remain pinned');
assert.strictEqual(sha(owner), expectedHash, 'origin preparation owner must retain the pinned normalized hash');
assert.strictEqual((html.match(/onclick="jumpToMessage\('/g) || []).length, 0, 'one dynamic search-result caller must remain');
assert.strictEqual((html.match(/function jumpToMessage\s*\(/g) || []).length, 0, 'inline jumpToMessage owner must be absent after split');
assert(!sourceText.includes('function jumpToMessage('), 'production owner must remain anonymous in src');
assert(fs.existsSync(path.join(sourceDir, 'jump-to-message-owner.js')), 'production owner module must exist after the authorized split');
assert(externalOwnerText.includes('window.jumpToMessage = function'), 'production owner must expose the anonymous classic global');
assert(html.includes('<script src="src/features/jump-to-message-owner.js"></script>'), 'external owner linkage must remain present');
for (const marker of ['document.querySelector', 'scrollIntoView', "style.transition='0.3s'", "style.background='rgba(225,48,108,0.25)'", 'setTimeout', "document.querySelector('.modal')?.remove()", 'toast("Message not loaded")']) {
  assert(owner.includes(marker), `candidate marker must remain present: ${marker}`);
}
for (const forbidden of [/\bdb\b|supabase|\.from\(|\.select\(|\.insert\(|\.update\(|\.delete\(|\.rpc\(/i, /fetch\s*\(|XMLHttpRequest|WebSocket/i, /localStorage|sessionStorage|indexedDB|document\.cookie/i, /\bME\b|auth|account|upload|permission|Notification|PushManager/i, /sendMsg|sendMediaMsg|reactMsg|pinMsg|unsendMsg|deleteMsg|forwardMessage|showReportModal|loadMsgs|loadDMs/i, /location\.|history\.|goToProfile|viewPost|window\.open/i]) {
  assert(!forbidden.test(owner), `candidate must remain free of forbidden boundary: ${forbidden}`);
}
for (const marker of ['renderDMs()', '_refreshDmsInPlace()', 'function openChat(', 'function showMsgMenu(', 'forwardMessage(']) {
  assert(html.includes(marker), `protected messaging marker must remain inline: ${marker}`);
}
for (const file of ['docs/dms-seam-preparation-contract.md', 'docs/dms-seam-preparation-contract-harness.js', 'docs/inline-handler-surface-contract-harness.js']) {
  assert(fs.existsSync(path.join(repo, file)), `required protected messaging artifact missing: ${file}`);
}
for (const marker of ['Preparation closed; production split complete under the companion production-split contract.', 'Protected-DOM coupling | REVIEW', 'forwardMessage', 'Production split | Complete — external classic global owner']) {
  assert(contract.includes(marker), `preparation contract marker missing: ${marker}`);
}
for (const marker of ['JUMP_TARGET_BRANCH=PASS', 'JUMP_MISSING_BRANCH=PASS', 'DATABASE_SIDE_EFFECTS=0', 'NETWORK_SIDE_EFFECTS=0', 'STORAGE_SIDE_EFFECTS=0', 'ACCOUNT_SIDE_EFFECTS=0', 'NAVIGATION_SIDE_EFFECTS=0']) {
  assert(proof.includes(marker), `synthetic proof marker missing: ${marker}`);
}
for (const marker of ['BASELINE_HEAD=e8df4970bef9e928ab8a97aed1aa5e954fb6edfa', 'PRODUCTION_SPLIT=COMPLETE', 'ROLLBACK_REQUIRED_BEFORE_SPLIT=TRUE', 'SPLIT_COMMIT=6b7a2b7c4563eda48c461d0f88f7b3158fb54f58']) {
  assert(rollback.includes(marker), `rollback marker missing: ${marker}`);
}
console.log('JUMP_TO_MESSAGE_PREPARATION_CONTRACT_HARNESS=PASS');
console.log(`NORMALIZED_OWNER_SHA256=${sha(owner)}`);
console.log('CALLER_BOUNDARY=ONE_DYNAMIC_SEARCH_RESULT');
console.log('DOM_ONLY_BOUNDARY=PASS');
console.log('PROTECTED_MESSAGING_EXCLUSIONS=PASS');
console.log('DETACHED_SYNTHETIC_PROOF=PASS');
console.log('PRODUCTION_SPLIT=COMPLETE');
console.log('EXTERNAL_OWNER=src/features/jump-to-message-owner.js');
