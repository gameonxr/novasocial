'use strict';

const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const repo = path.resolve(__dirname, '..');
const indexPath = path.join(repo, 'index.html');
const source = fs.readFileSync(indexPath, 'utf8');
const originMain = execFileSync('git', ['show', 'origin/main:index.html'], {
  cwd: repo,
  encoding: 'utf8',
  maxBuffer: 20 * 1024 * 1024,
});

function extractOwner(text) {
  const match = text.match(/function toggleSVMute\(\) \{[\s\S]*?\n\}/);
  assert(match, 'toggleSVMute owner must exist');
  return match[0];
}

function normalize(text) {
  return text.replace(/\s+/g, ' ').trim();
}

const originOwner = extractOwner(originMain);
const currentOwner = extractOwner(source);
const normalizedOrigin = normalize(originOwner);
const normalizedCurrent = normalize(currentOwner);
const ownerHash = crypto.createHash('sha256').update(normalizedOrigin).digest('hex');

assert.strictEqual(normalizedCurrent, normalizedOrigin, 'current inline owner must retain normalized origin/main parity');
assert.strictEqual(ownerHash, 'edb16d31659caa52d9136da381a53675955275dba6d26026d75dfd4eb006636d', 'origin owner hash must remain pinned');
assert.strictEqual((source.match(/function toggleSVMute\(\)\s*\{/g) || []).length, 1, 'candidate must have one named inline owner before split');
assert.strictEqual((source.match(/onclick="toggleSVMute\(\)"/g) || []).length, 1, 'story-viewer mute control must retain one caller');
assert.strictEqual((source.match(/src\/features\/toggle-sv-mute-owner\.js/g) || []).length, 0, 'candidate module must not exist before production split');
assert(currentOwner.includes('window._svMuted = !window._svMuted;'), 'candidate must flip existing mute state');
assert(currentOwner.includes("document.querySelector('#sv-media video')"), 'candidate must query existing story-viewer video control');
assert(currentOwner.includes('renderSV();'), 'candidate must delegate one existing story-viewer render');
assert(!/\bdb\.|localStorage|sessionStorage|fetch\(|navigator\.|location\.|notification|upload|\b(?:insert|update|delete|upsert|rpc)\s*\(/i.test(currentOwner), 'candidate must have no direct stateful or persistence boundary');

function createInjectedToggleSVMuteSeam({ state, querySelector, render }) {
  return function toggleSVMuteInjected() {
    state.svMuted = !state.svMuted;
    const video = querySelector('#sv-media video');
    if (video) video.muted = state.svMuted;
    render();
  };
}

const state = { svMuted: false };
const video = { muted: false };
const queries = [];
let renderCount = 0;
const seam = createInjectedToggleSVMuteSeam({
  state,
  querySelector(selector) {
    queries.push(selector);
    return selector === '#sv-media video' ? video : null;
  },
  render() {
    renderCount += 1;
  },
});

seam();
assert.strictEqual(state.svMuted, true, 'first toggle must mute state');
assert.strictEqual(video.muted, true, 'first toggle must mute current video');
assert.strictEqual(renderCount, 1, 'first toggle must delegate exactly one render');
seam();
assert.strictEqual(state.svMuted, false, 'second toggle must unmute state');
assert.strictEqual(video.muted, false, 'second toggle must unmute current video');
assert.strictEqual(renderCount, 2, 'second toggle must delegate exactly one render');
const missingVideo = createInjectedToggleSVMuteSeam({
  state,
  querySelector: () => null,
  render: () => { renderCount += 1; },
});
missingVideo();
assert.strictEqual(state.svMuted, true, 'missing-video toggle must still update state');
assert.strictEqual(renderCount, 3, 'missing-video toggle must still delegate one render');
assert.deepStrictEqual(queries, ['#sv-media video', '#sv-media video'], 'video lookup must remain scoped to the existing story-viewer selector');

console.log('TOGGLE_SV_MUTE_PREPARATION_CONTRACT_HARNESS=PASS');
console.log('EXACT_ORIGIN_OWNER_PARITY=PASS');
console.log(`NORMALIZED_OWNER_SHA256=${ownerHash}`);
console.log('CALLER_BOUNDARY=ONE_STORY_VIEWER_MUTE_CONTROL');
console.log('FILTER_CASES=VIDEO_PRESENT_TOGGLE_ROUNDTRIP_MISSING_VIDEO');
console.log('STATEFUL_BOUNDARIES=ABSENT');
console.log('INJECTED_SEAM=PASS');
console.log('PRODUCTION_MODULE=ABSENT_PRE_SPLIT');
console.log('DETACHED_BROWSER_SCOPE=REQUIRED');
console.log('ROLLBACK_BASELINE=PINNED');
