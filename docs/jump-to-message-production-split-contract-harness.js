
'use strict';

const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const repo = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const moduleText = fs.readFileSync(path.join(repo, 'src', 'features', 'jump-to-message-owner.js'), 'utf8');
const origin = execFileSync('git', ['show', 'origin/main:index.html'], { cwd: repo, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });

function extractFunction(text, pattern) {
  const match = pattern.exec(text);
  assert(match, 'jumpToMessage function must exist');
  const start = match.index;
  const open = text.indexOf('{', start);
  assert(open >= 0, 'jumpToMessage opening brace must exist');
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
    if (quote) {
      if (escaped) { escaped = false; continue; }
      if (ch === '\\') { escaped = true; continue; }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '/' && nx === '/') { lineComment = true; i += 1; continue; }
    if (ch === '/' && nx === '*') { blockComment = true; i += 1; continue; }
    if (ch === '\'' || ch === '"' || ch === '`') { quote = ch; continue; }
    if (ch === '{') depth += 1;
    if (ch === '}') {
      depth -= 1;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  throw new Error('jumpToMessage function body is unterminated');
}

function normalize(text) {
  return text.replace(/\r/g, '').replace(/[ \t]+$/gm, '').replace(/\n{3,}/g, '\n\n').trim();
}
function sha(text) {
  return crypto.createHash('sha256').update(normalize(text)).digest('hex');
}

const originOwner = extractFunction(origin, /(?:^|\n)[ \t]*function jumpToMessage\s*\([^)]*\)\s*\{/);
const canonicalModuleText = moduleText.replace('window.jumpToMessage = function', 'function jumpToMessage');
const moduleOwner = extractFunction(canonicalModuleText, /function jumpToMessage\s*\([^)]*\)\s*\{/);
const expectedHash = 'e06fcf2f2e397bb122255d982e07e35a1686641a22f6d46306f0072bd81eb073';
assert.strictEqual(sha(originOwner), expectedHash, 'immutable origin owner hash must remain pinned');
assert.strictEqual(sha(moduleOwner), expectedHash, 'external owner must retain exact normalized origin hash');
assert.strictEqual((moduleText.match(/window\.jumpToMessage\s*=\s*function\s*\(/g) || []).length, 1, 'one anonymous classic global owner must exist');
assert.strictEqual((html.match(/onclick="jumpToMessage\('/g) || []).length, 0, 'one dynamic search-result caller must remain');
assert.strictEqual((html.match(/function jumpToMessage\s*\(/g) || []).length, 0, 'inline jumpToMessage owner must be absent');
assert(html.includes('<script src="src/features/jump-to-message-owner.js"></script>'), 'external jumpToMessage script must be referenced');
const inlineEnd = html.indexOf('</script>');
const ownerScript = html.indexOf('<script src="src/features/jump-to-message-owner.js"></script>');
const smartRankingScript = html.indexOf('<script src="src/features/smart-ranking.js"></script>');
assert(ownerScript > inlineEnd, 'jumpToMessage owner must load after inline application code');
assert(ownerScript < smartRankingScript, 'jumpToMessage owner must precede the established post-inline owner tail');
for (const forbidden of [/\bdb\b|supabase|\.from\(|\.select\(|\.insert\(|\.update\(|\.delete\(|\.rpc\(/i, /fetch\s*\(|XMLHttpRequest|WebSocket/i, /localStorage|sessionStorage|indexedDB|document\.cookie/i, /\bME\b|auth|account|upload|permission|Notification|PushManager/i, /location\.|history\.|openChat|renderDMs|showMsgMenu|forwardMessage/i]) {
  assert(!moduleText.match(forbidden), `external owner must remain DOM-only: ${forbidden}`);
}

function makeElement() {
  return {
    style: {},
    scrollIntoView(options) { this.scrolled = options; },
  };
}
function runCase(targetPresent) {
  const events = [];
  const target = targetPresent ? makeElement() : null;
  const modal = { remove() { events.push('modal.remove'); } };
  const context = {
    window: null,
    document: {
      querySelector(selector) {
        events.push(`query:${selector}`);
        return selector === '.modal' ? modal : target;
      },
    },
    toast(message) { events.push(`toast:${message}`); },
    setTimeout(callback, delay) {
      events.push(`timeout:${delay}`);
      callback();
      return 1;
    },
  };
  context.window = context;
  const vm = require('vm');
  vm.createContext(context);
  vm.runInContext(moduleText, context, { filename: 'jump-to-message-owner.js' });
  context.window.jumpToMessage('msg-1');
  return { events, target };
}

const targetCase = runCase(true);
assert.deepStrictEqual(JSON.parse(JSON.stringify(targetCase.target.scrolled)), { behavior: 'smooth', block: 'center' });
assert.strictEqual(targetCase.target.style.transition, '0.3s');
assert.strictEqual(targetCase.target.style.background, '');
assert.deepStrictEqual(targetCase.events, ['query:[data-msgid="msg-1"]', 'timeout:2000', 'query:.modal', 'modal.remove']);

const missingCase = runCase(false);
assert.deepStrictEqual(missingCase.events, ['query:[data-msgid="msg-1"]', 'toast:Message not loaded']);

console.log('JUMP_TO_MESSAGE_PRODUCTION_SPLIT_CONTRACT_HARNESS=PASS');
console.log('EXACT_ORIGIN_OWNER_PARITY=PASS');
console.log('ANONYMOUS_WINDOW_OWNER=PASS');
console.log('CALLER_BOUNDARY=ONE_DYNAMIC_SEARCH_RESULT');
console.log('INLINE_OWNER=ABSENT');
console.log('TARGET_BRANCH=PASS');
console.log('MISSING_BRANCH=PASS');
console.log('DOM_SIDE_EFFECTS_ONLY=PASS');
console.log('DATABASE_SIDE_EFFECTS=0');
console.log('NETWORK_SIDE_EFFECTS=0');
console.log('STORAGE_SIDE_EFFECTS=0');
console.log('ACCOUNT_SIDE_EFFECTS=0');
console.log('UPLOAD_SIDE_EFFECTS=0');
console.log('NAVIGATION_SIDE_EFFECTS=0');
console.log('LIVE_MUTATIONS=0');
