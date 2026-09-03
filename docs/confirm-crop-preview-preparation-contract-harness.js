'use strict';

const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const repo = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const originHtml = execFileSync('git', ['show', 'origin/main:index.html'], { cwd: repo, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
const signature = 'async function confirmCropPreview()';

function extractFunction(text) {
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

const ownerModulePath = path.join(repo, 'src', 'features', 'confirm-crop-preview-owner.js');
const hasInlineOwner = (html.match(/async function confirmCropPreview\(\)\s*\{/g) || []).length === 1;
const externalOwnerSource = fs.readFileSync(ownerModulePath, 'utf8');
const currentOwner = hasInlineOwner ? extractFunction(html) : extractFunction(externalOwnerSource.replace('window.confirmCropPreview = async function()', signature));
const originOwner = extractFunction(originHtml);
const normalizedCurrent = normalize(currentOwner);
const normalizedOrigin = normalize(originOwner);
const body = currentOwner.slice(currentOwner.indexOf('{') + 1, currentOwner.lastIndexOf('}'));
const statefulTokens = ['db.', 'localStorage', 'sessionStorage', 'fetch(', 'navigator.', 'location.', 'notification', 'permission', 'upload(', 'navigate(', 'account', 'message', 'follow', 'like', 'comment', 'insert(', 'update(', 'upsert(', 'delete(', 'rpc('];
const sourceFiles = execFileSync('find', [path.join(repo, 'src'), '-type', 'f', '-name', '*.js'], { cwd: repo, encoding: 'utf8' }).trim().split('\n').filter(Boolean);

assert.strictEqual(normalizedCurrent, normalizedOrigin, 'current candidate must preserve normalized origin/main parity');
assert.strictEqual(sha256(normalizedOrigin), '668fae8c651998f577e5edb1f361c8ce5868f6050eeb7afea2c81a7f84723ab4', 'normalized origin hash must match the pinned candidate audit');
assert.strictEqual(sourceFiles.length, hasInlineOwner ? 228 : 279, 'source module count must match the current post-split candidate state for Notes submission');
assert.strictEqual((html.match(/async function confirmCropPreview\(\)\s*\{/g) || []).length, hasInlineOwner ? 1 : 0, 'candidate inline owner count must match the current pre/post-split state');
assert.strictEqual((html.match(/onclick="confirmCropPreview\(\)"/g) || []).length, 1, 'candidate must retain exactly one existing Done control caller');
assert.strictEqual(fs.existsSync(ownerModulePath), !hasInlineOwner, 'candidate external owner presence must match the current pre/post-split state');
assert.deepStrictEqual(statefulTokens.filter(token => new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(body)), [], 'candidate must contain no stateful operation tokens');
for (const required of ['document.getElementById', 'canvas', 'drawImage', 'toBlob', 'new File', 'closeCropPreview', 'onConfirm']) {
  assert(body.includes(required), `candidate must retain ${required}`);
}

class SyntheticFile {
  constructor(parts, name, options) {
    this.parts = parts;
    this.name = name;
    this.type = options.type;
  }
}

async function runCase({ missing = false, failBlob = false }) {
  const events = [];
  const originalFile = { name: 'original.png', marker: 'original' };
  const confirmed = [];
  const viewport = { clientWidth: 100, clientHeight: 50 };
  const image = { naturalWidth: 200, naturalHeight: 100 };
  const canvas = {
    width: 0,
    height: 0,
    getContext() {
      return { drawImage: (...args) => events.push(['drawImage', ...args.slice(1)]) };
    },
    toBlob(callback) {
      if (failBlob) throw new Error('synthetic blob failure');
      callback({ size: 8, type: 'image/jpeg' });
    },
  };
  const syntheticDocument = {
    getElementById(id) {
      events.push(`lookup:${id}`);
      if (missing) return null;
      if (id === 'crop-viewport') return viewport;
      if (id === 'crop-image') return image;
      return null;
    },
    createElement(tag) {
      assert.strictEqual(tag, 'canvas', 'candidate must create only a canvas in this seam');
      events.push('canvas:create');
      return canvas;
    },
  };
  const cropState = { file: originalFile, cropType: 'avatar', scale: 2, offsetX: 10, offsetY: 5, onConfirm: file => confirmed.push(file) };
  const closeCropPreview = () => events.push('preview:close');
  const toast = message => events.push(`toast:${message}`);
  const owner = Function('document', 'File', '_cropState', 'closeCropPreview', 'toast', `return (${currentOwner});`)(syntheticDocument, SyntheticFile, cropState, closeCropPreview, toast);
  await owner();
  return { events, canvas, confirmed, originalFile };
}

(async () => {
  const success = await runCase({});
  assert.strictEqual(success.canvas.width, 500, 'avatar crop must preserve 500px output width');
  assert.strictEqual(success.canvas.height, 500, 'avatar crop must preserve 500px output height');
  assert(success.events.some(event => Array.isArray(event) && event[0] === 'drawImage'), 'success seam must draw the selected crop');
  assert.strictEqual(success.events.at(-1), 'preview:close', 'success seam must close through the existing owner before callback delivery');
  assert.strictEqual(success.confirmed.length, 1, 'success seam must invoke one confirmation callback');
  assert.strictEqual(success.confirmed[0].name, 'original.png', 'cropped file must retain the source filename');
  assert.strictEqual(success.confirmed[0].type, 'image/jpeg', 'cropped file must be JPEG');

  const missing = await runCase({ missing: true });
  assert.deepStrictEqual(missing.events, ['lookup:crop-viewport', 'lookup:crop-image', 'preview:close'], 'missing-input seam must close safely without canvas or callback work');
  assert.strictEqual(missing.confirmed.length, 0, 'missing-input seam must not invoke the callback');

  const failed = await runCase({ failBlob: true });
  assert(failed.events.some(event => typeof event === 'string' && event.startsWith('toast:❌ Crop failed')), 'conversion failure must preserve the existing fallback toast');
  assert.strictEqual(failed.confirmed.length, 1, 'conversion failure must invoke one fallback callback');
  assert.strictEqual(failed.confirmed[0], failed.originalFile, 'conversion failure must pass the original file');

  console.log('CONFIRM_CROP_PREVIEW_PREPARATION_CONTRACT_HARNESS=PASS');
  console.log('EXACT_ORIGIN_OWNER_PARITY=PASS');
  console.log(`NORMALIZED_OWNER_SHA256=${sha256(normalizedOrigin)}`);
  console.log('CALLER_BOUNDARY=ONE_DONE_CONTROL');
  console.log('STATEFUL_BOUNDARIES=ABSENT');
  console.log('INJECTED_SEAM=PASS');
  console.log('CROP_BRANCHES=SUCCESS_MISSING_INPUT_CONVERSION_ERROR');
  console.log(`PRODUCTION_MODULE=${hasInlineOwner ? 'ABSENT_PRE_SPLIT' : 'EXTERNAL_OWNER'}`);
  console.log('DETACHED_BROWSER_SCOPE=PASS');
})().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
