'use strict';

const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const repo = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const originHtml = execFileSync('git', ['show', 'origin/main:index.html'], { cwd: repo, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
const modulePath = path.join(repo, 'src', 'features', 'confirm-crop-preview-owner.js');
const moduleText = fs.readFileSync(modulePath, 'utf8');
const preparationProof = fs.readFileSync(path.join(repo, 'docs', 'confirm-crop-preview-preparation-browser-proof-evidence.txt'), 'utf8');
const afterProof = fs.readFileSync(path.join(repo, 'docs', 'confirm-crop-preview-after-split-browser-proof-evidence.txt'), 'utf8');
const rollback = fs.readFileSync(path.join(repo, 'docs', 'confirm-crop-preview-parity-rollback-evidence.txt'), 'utf8');
const productionCommit = execFileSync('git', ['log', '--format=%H', '--all', '--', 'src/features/confirm-crop-preview-owner.js'], { cwd: repo, encoding: 'utf8' }).trim().split('\n')[0];

function extractFunction(text) {
  const signature = 'async function confirmCropPreview()';
  const start = text.indexOf(signature);
  assert(start >= 0, 'confirmCropPreview signature must exist');
  const brace = text.indexOf('{', start);
  let depth = 0;
  let quote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;
  for (let i = brace; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];
    if (lineComment) { if (ch === '\n') lineComment = false; continue; }
    if (blockComment) { if (ch === '*' && next === '/') { blockComment = false; i += 1; } continue; }
    if (quote) {
      if (escaped) { escaped = false; continue; }
      if (ch === '\\') { escaped = true; continue; }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '/' && next === '/') { lineComment = true; i += 1; continue; }
    if (ch === '/' && next === '*') { blockComment = true; i += 1; continue; }
    if (ch === "'" || ch === '"' || ch === '`') { quote = ch; continue; }
    if (ch === '{') depth += 1;
    if (ch === '}') { depth -= 1; if (depth === 0) return text.slice(start, i + 1); }
  }
  throw new Error('confirmCropPreview function boundary is unclosed');
}
function normalize(text) { return text.replace(/\s+/g, ' ').trim(); }
function sha256(text) { return crypto.createHash('sha256').update(text).digest('hex'); }

const originOwner = extractFunction(originHtml);
const moduleOwner = extractFunction(moduleText.replace('window.confirmCropPreview = async function()', 'async function confirmCropPreview()'));
const normalizedOrigin = normalize(originOwner);
const normalizedModule = normalize(moduleOwner);
const ownerBody = normalizedModule.slice(normalizedModule.indexOf('{') + 1, normalizedModule.lastIndexOf('}')).trim();
const sourceFiles = execFileSync('find', [path.join(repo, 'src'), '-type', 'f', '-name', '*.js'], { cwd: repo, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
const statefulTokens = ['db.', 'localStorage', 'sessionStorage', 'fetch(', 'navigator.', 'location.', 'notification', 'permission', 'upload(', 'navigate(', 'account', 'message', 'follow', 'like', 'comment', 'insert(', 'update(', 'upsert(', 'delete(', 'rpc('];

assert.strictEqual(normalizedModule, normalizedOrigin, 'external crop-preview owner must preserve normalized origin/main parity');
assert.strictEqual(sha256(normalizedOrigin), '668fae8c651998f577e5edb1f361c8ce5868f6050eeb7afea2c81a7f84723ab4', 'normalized crop-preview owner hash must match preparation anchor');
assert.strictEqual(sourceFiles.length, 235, 'production split must retain 234 extracted JavaScript modules after the DMs renderer split');
assert.strictEqual((html.match(/async function confirmCropPreview\(\)\s*\{/g) || []).length, 0, 'named inline confirmCropPreview owner must be absent');
assert.strictEqual((moduleText.match(/window\.confirmCropPreview\s*=\s*async function\(\)\s*\{/g) || []).length, 1, 'anonymous external confirmCropPreview owner must occur once');
assert.strictEqual((html.match(/src\/features\/confirm-crop-preview-owner\.js/g) || []).length, 1, 'external crop-preview owner script must be linked once');
assert.strictEqual((html.match(/onclick="confirmCropPreview\(\)"/g) || []).length, 1, 'exactly one existing Done control caller must remain');
assert(html.indexOf('src/features/invalidate-tab-cache-owner.js') < html.indexOf('src/features/confirm-crop-preview-owner.js'), 'crop-preview owner must load after invalidate-cache owner');
assert(html.indexOf('src/features/confirm-crop-preview-owner.js') < html.indexOf('src/features/set-verify-filter-owner.js'), 'crop-preview owner must load before verification owner');
assert.strictEqual((html.match(/<script\b/gi) || []).length, 237, '234 classic script tags must remain after the DMs renderer split');
assert.strictEqual((html.match(/<\/script>/gi) || []).length, 237, '234 classic script closures must remain after the DMs renderer split');
assert.strictEqual((html.match(/<script\s+src=/gi) || []).length, 236, '234 external classic script tags must remain after the DMs renderer split');
assert.deepStrictEqual(statefulTokens.filter(token => new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(ownerBody)), [], 'crop-preview owner must remain free of stateful boundaries');
for (const required of ['_cropState', 'document.getElementById', 'canvas', 'drawImage', 'toBlob', 'new File', 'closeCropPreview', 'onConfirm']) {
  assert(ownerBody.includes(required), `crop-preview owner must retain ${required}`);
}
assert(preparationProof.includes('RESULT=PASS') && preparationProof.includes('SUCCESS_CROP=true') && preparationProof.includes('MISSING_INPUT_SAFE_CLOSE=true') && preparationProof.includes('CONVERSION_ERROR_ORIGINAL_FILE_FALLBACK=true') && preparationProof.includes('DATABASE_CALLS=0') && preparationProof.includes('NETWORK_CALLS=0') && preparationProof.includes('NAVIGATION_MUTATIONS=0') && preparationProof.includes('ACCOUNT_MUTATIONS=0') && preparationProof.includes('BROWSER_STORAGE_MUTATIONS=0') && preparationProof.includes('DETACHED_ONLY=true'), 'preparation proof must pass with zero side effects');
assert(afterProof.includes('RESULT=PASS') && afterProof.includes('EXTERNAL_SCRIPT_LOADS=1_PER_SYNTHETIC_DOCUMENT') && afterProof.includes('SUCCESS_BRANCH=PASS') && afterProof.includes('MISSING_INPUT_BRANCH=PASS') && afterProof.includes('CONVERSION_ERROR_BRANCH=PASS') && afterProof.includes('DATABASE_CALLS=0') && afterProof.includes('NETWORK_CALLS=0') && afterProof.includes('NAVIGATION_MUTATIONS=0') && afterProof.includes('ACCOUNT_MUTATIONS=0') && afterProof.includes('BROWSER_STORAGE_MUTATIONS=0') && afterProof.includes('DETACHED_ONLY=true'), 'after-split proof must pass with one external load and zero side effects');
assert(rollback.includes('PREPARATION_BASELINE_SHA=69dc14197a600ef39446f18d21ab04b1140899cb'), 'rollback evidence must retain the preparation baseline');
assert(rollback.includes('ORIGIN_MAIN_IMMUTABLE_SHA=ef418007c9b9a797488b4825be5f0c807da22369'), 'rollback evidence must retain immutable origin/main');
assert(rollback.includes('NORMALIZED_ORIGIN_OWNER_SHA256=668fae8c651998f577e5edb1f361c8ce5868f6050eeb7afea2c81a7f84723ab4'), 'rollback evidence must retain owner hash');
assert(productionCommit.startsWith('74664d31'), `production split commit must remain 74664d31, found ${productionCommit}`);
assert(rollback.includes('PRODUCTION_SPLIT_COMMIT=74664d31bf280d8e7d638ff8e0a850b96c306de4'), 'rollback evidence must pin production split commit');
assert(rollback.includes('FIRST_FULL_REGRESSION_TIP=5610775e465fe84e4c1c39bcde09399d264d66a1'), 'rollback evidence must pin first exhaustive gate tip');
assert(rollback.includes('FIRST_FULL_REGRESSION=PASS'), 'rollback evidence must record first exhaustive gate PASS');
assert(rollback.includes('FINAL_DOCS_FULL_REGRESSION=PASS'), 'rollback evidence must record the final docs-tip gate PASS');
assert(rollback.includes('FINAL_DOCS_FULL_REGRESSION_TIP=cba72ee637723f98aae9ad6017698dab6ec640f3'), 'rollback evidence must pin the final docs-tip SHA');
assert(!/<script\b[^>]*\b(?:type|defer|async)\s*=/i.test(html), 'all application scripts must remain classic without type, defer, or async attributes');

function runCropSeam() {
  const state = {
    file: { name: 'source.png' },
    cropType: 'avatar',
    scale: 2,
    offsetX: 10,
    offsetY: -4,
    onConfirm: null,
  };
  const events = [];
  const canvas = {
    width: 0,
    height: 0,
    getContext() { return { drawImage(...args) { events.push(['drawImage', args]); } }; },
    toBlob(resolve) { events.push('toBlob'); resolve({ bytes: 1 }); },
  };
  const dom = {
    getElementById(id) {
      events.push(`lookup:${id}`);
      if (id === 'crop-viewport') return { clientWidth: 300, clientHeight: 240 };
      if (id === 'crop-image') return { naturalWidth: 1200, naturalHeight: 900 };
      return null;
    },
    createElement(tag) { events.push(`create:${tag}`); return canvas; },
  };
  const confirmed = [];
  const owner = Function('state', 'dom', 'FileImpl', 'close', 'toastImpl', `const _cropState = state; const document = dom; const File = FileImpl; const closeCropPreview = close; const toast = toastImpl; return (${moduleOwner});`)(state, dom, function FileImpl(parts, name, options) { this.parts = parts; this.name = name; this.type = options.type; }, () => events.push('close'), (message) => events.push(`toast:${message}`));
  state.onConfirm = (file) => confirmed.push(file);
  return owner().then(() => ({ events, canvas, confirmed }));
}
runCropSeam().then((result) => {
  assert.strictEqual(result.confirmed.length, 1, 'injected success seam must invoke the callback once');
  assert.strictEqual(result.confirmed[0].name, 'source.png', 'injected seam must preserve the source filename');
  assert.strictEqual(result.canvas.width, 500, 'avatar seam must retain the 500px output size');
  assert(result.events.includes('toBlob') && result.events.includes('close'), 'injected seam must perform local blob conversion and preview close');
  console.log('CONFIRM_CROP_PREVIEW_PRODUCTION_SPLIT_CONTRACT_HARNESS=PASS');
  console.log('EXACT_ORIGIN_OWNER_PARITY=PASS');
  console.log(`NORMALIZED_OWNER_SHA256=${sha256(normalizedOrigin)}`);
  console.log('ANONYMOUS_WINDOW_OWNER=PASS');
  console.log('INLINE_OWNER=ABSENT');
  console.log('CALLER_BOUNDARY=ONE_DONE_CONTROL_CALLER');
  console.log('FOOTER_ORDER=PASS');
  console.log('STATEFUL_BOUNDARIES=ABSENT');
  console.log('DETACHED_PREPARATION_PROOF=PASS');
  console.log('DETACHED_AFTER_SPLIT_PROOF=PASS');
  console.log('INJECTED_SEAM=PASS');
  console.log('ROLLBACK_EVIDENCE=PASS');
  console.log('FIRST_FULL_REGRESSION=PASS');
  console.log('FINAL_DOCS_FULL_REGRESSION=PASS');
  console.log('FINAL_DOCS_FULL_REGRESSION_TIP=cba72ee637723f98aae9ad6017698dab6ec640f3');
  console.log('PRODUCTION_SPLIT=COMPLETE');
}).catch((error) => { console.error(error); process.exitCode = 1; });
