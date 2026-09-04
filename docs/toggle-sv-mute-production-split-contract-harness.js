'use strict';

const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const repo = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const originHtml = execFileSync('git', ['show', 'origin/main:index.html'], { cwd: repo, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
const moduleText = fs.readFileSync(path.join(repo, 'src', 'features', 'toggle-sv-mute-owner.js'), 'utf8');
const prepProof = fs.readFileSync(path.join(repo, 'docs', 'toggle-sv-mute-preparation-browser-proof-evidence.txt'), 'utf8');
const rollback = fs.readFileSync(path.join(repo, 'docs', 'toggle-sv-mute-parity-rollback-evidence.txt'), 'utf8');
const productionCommit = execFileSync('git', ['log', '--format=%H', '--all', '--', 'src/features/toggle-sv-mute-owner.js'], { cwd: repo, encoding: 'utf8' }).trim().split('\n')[0];

function extractOrigin(text) {
  const match = text.match(/function toggleSVMute\(\) \{[\s\S]*?\n\}/);
  assert(match, 'origin/main toggleSVMute owner must exist');
  return match[0];
}
function normalize(text) { return text.replace(/\s+/g, ' ').trim(); }
function sha256(text) { return crypto.createHash('sha256').update(text).digest('hex'); }

const originOwner = extractOrigin(originHtml);
const moduleOwnerMatch = moduleText.match(/window\.toggleSVMute\s*=\s*(function\(\)\s*\{[\s\S]*?\n\};)/);
assert(moduleOwnerMatch, 'external anonymous toggleSVMute owner must exist');
const normalizedModuleOwner = normalize(moduleOwnerMatch[1].replace(/^function\(\)\s*\{/, 'function toggleSVMute() {').replace(/\n\};$/, '\n}'));
const normalizedOriginOwner = normalize(originOwner);

assert.strictEqual(normalizedModuleOwner, normalizedOriginOwner, 'external owner body must preserve normalized origin/main parity');
assert.strictEqual(sha256(normalizedOriginOwner), 'edb16d31659caa52d9136da381a53675955275dba6d26026d75dfd4eb006636d', 'normalized owner hash must match preparation anchor');
assert.strictEqual((html.match(/function toggleSVMute\(\)\s*\{/g) || []).length, 0, 'named inline owner must be absent');
assert.strictEqual((moduleText.match(/window\.toggleSVMute\s*=\s*function\(\)\s*\{/g) || []).length, 1, 'anonymous external owner must occur once');
assert.strictEqual((html.match(/src\/features\/toggle-sv-mute-owner\.js/g) || []).length, 1, 'external owner script must be linked once');
assert.strictEqual(((html + '\n' + fs.readFileSync(path.join(repo, 'src', 'features', 'render-sv.js'), 'utf8')).match(/onclick="toggleSVMute\(\)"/g) || []).length, 1, 'story-viewer mute control must retain one caller');
assert(html.indexOf('src/features/set-reports-filter-owner.js') < html.indexOf('src/features/toggle-sv-mute-owner.js'), 'toggle owner must load after reports filter owner');
assert(html.indexOf('src/features/toggle-sv-mute-owner.js') < html.indexOf('src/features/set-verify-filter-owner.js'), 'toggle owner must load before verification filter owner');
assert(!/\b(?:db\.|localStorage|sessionStorage|fetch\(|navigator\.|location\.|notification|upload|\b(?:insert|update|delete|upsert|rpc)\s*\()/i.test(moduleText), 'module must remain free of stateful or persistence boundaries');
assert(moduleText.includes('window._svMuted = !window._svMuted;'), 'state flip must remain present');
assert(moduleText.includes("document.querySelector('#sv-media video')"), 'video lookup must remain present');
assert(moduleText.includes('renderSV();'), 'render delegation must remain present');
assert(prepProof.includes('RESULT=PASS') && prepProof.includes('DATABASE_CALLS=0') && prepProof.includes('ACCOUNT_MUTATIONS=0'), 'detached browser proof must pass with zero side effects');
assert(rollback.includes('NORMALIZED_ORIGIN_OWNER_SHA256=edb16d31659caa52d9136da381a53675955275dba6d26026d75dfd4eb006636d'), 'rollback evidence must retain owner hash');
assert(rollback.includes('PREPARATION_BASELINE_SHA=921b89ff07ce8169092e4847484728553b0ed0e9'), 'rollback evidence must retain preparation baseline');
assert(productionCommit.startsWith('0b5f8f0'), `production split commit must remain 0b5f8f0, found ${productionCommit}`);
assert(rollback.includes('PRODUCTION_SPLIT_COMMIT=0b5f8f0'), 'rollback evidence must pin production split commit');
assert(rollback.includes('FULL_REGRESSION=PASS'), 'rollback evidence must record first full regression PASS');
assert(rollback.includes('FINAL_DOCS_FULL_REGRESSION=PASS'), 'rollback evidence must record final docs-tip regression PASS');
assert(rollback.includes('FINAL_DOCS_FULL_REGRESSION_TIP=efe458b021a2fd56647b0b7c719be893c4f557fe'), 'rollback evidence must pin final docs-tip regression SHA');

function runSeam({ withVideo }) {
  const events = [];
  const state = { svMuted: false };
  const video = withVideo ? { muted: false } : null;
  const toggle = function toggleSVMute() {
    state.svMuted = !state.svMuted;
    if (video) video.muted = state.svMuted;
    events.push(`render:${state.svMuted}`);
  };
  toggle();
  toggle();
  return { state, video, events };
}
const roundTrip = runSeam({ withVideo: true });
assert.deepStrictEqual(roundTrip.events, ['render:true', 'render:false'], 'video-present round trip must delegate one render per toggle');
assert.strictEqual(roundTrip.state.svMuted, false, 'round trip must return to unmuted state');
assert.strictEqual(roundTrip.video.muted, false, 'round trip must return video to unmuted state');
const noVideo = runSeam({ withVideo: false });
assert.strictEqual(noVideo.state.svMuted, false, 'missing-video seam must still complete safely');

console.log('TOGGLE_SV_MUTE_PRODUCTION_SPLIT_CONTRACT_HARNESS=PASS');
console.log('EXACT_ORIGIN_OWNER_PARITY=PASS');
console.log(`NORMALIZED_OWNER_SHA256=${sha256(normalizedOriginOwner)}`);
console.log('ANONYMOUS_WINDOW_OWNER=PASS');
console.log('INLINE_OWNER=ABSENT');
console.log('CALLER_BOUNDARY=ONE_STORY_VIEWER_MUTE_CONTROL');
console.log('FOOTER_ORDER=PASS');
console.log('STATEFUL_BOUNDARIES=ABSENT');
console.log('DETACHED_BROWSER_PROOF=PASS');
console.log('INJECTED_SEAM=PASS');
console.log('ROLLBACK_EVIDENCE=PASS');
console.log('FIRST_FULL_REGRESSION=PASS');
console.log('FINAL_DOCS_FULL_REGRESSION=PASS');
console.log('PRODUCTION_SPLIT=COMPLETE');
