'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'show-gc.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

for (const forbidden of [
  /\bdb\b|supabase|\.from\(|\.select\(|\.insert\(|\.update\(|\.delete\(|\.rpc\(/i,
  /fetch\s*\(|XMLHttpRequest|WebSocket/i,
  /localStorage|sessionStorage|indexedDB|document\.cookie/i,
  /navigator\.mediaDevices|MediaRecorder|RTCPeerConnection|upload\s*\(/i,
  /location\.|history\.|Notification|PushManager/i,
]) {
  assert(!forbidden.test(source), `group-call setup renderer must remain side-effect-free: ${forbidden}`);
}
assert(html.includes('src/features/show-gc.js'), 'group-call setup renderer must remain linked from HTML');
assert.strictEqual((source.match(/async function showGC\s*\(/g) || []).length, 1, 'renderer must have one global owner');

const body = { innerHTML: '' };
const events = [];
let iconCalls = 0;
let protectedSearchCalls = 0;
let protectedCreateCalls = 0;
const context = {
  window: { _gcs: ['stale-user'] },
  modal(title) {
    events.push(`modal:${title}`);
    return { querySelector(selector) { assert.strictEqual(selector, '#mbody'); return body; } };
  },
  ico(name, color, size) {
    iconCalls += 1;
    assert.deepStrictEqual([name, color, size], ['search', '#666', 18], 'renderer must request the existing search icon');
    return '<svg data-synthetic-icon="search"></svg>';
  },
  searchGC() {
    protectedSearchCalls += 1;
  },
  createGC() {
    protectedCreateCalls += 1;
  },
};
vm.createContext(context);
vm.runInContext(source, context, { filename: 'show-gc.js' });
assert.strictEqual(typeof context.showGC, 'function', 'renderer must remain globally callable');

(async () => {
  const result = context.showGC();
  assert.strictEqual(typeof result.then, 'function', 'async-compatible renderer return must remain available');
  await result;

  assert.deepStrictEqual(events, ['modal:New Group Chat'], 'renderer must open the existing group-chat modal');
  assert.strictEqual(iconCalls, 1, 'renderer must request one search icon');
  assert.deepStrictEqual(Array.from(context.window._gcs), [], 'renderer must reset only the local participant-selection list');
  assert(body.innerHTML.includes('Group name...'), 'renderer must preserve the group-name placeholder');
  assert(body.innerHTML.includes('id="gc-n"'), 'renderer must preserve the group-name input id');
  assert(body.innerHTML.includes('Members search...'), 'renderer must preserve the member-search placeholder');
  assert(body.innerHTML.includes('id="gc-s"'), 'renderer must preserve the member-search input id');
  assert(body.innerHTML.includes('id="gc-r"'), 'renderer must preserve the member-result container id');
  assert(body.innerHTML.includes('oninput="searchGC(this.value)"'), 'renderer must preserve the protected search callback wiring');
  assert(body.innerHTML.includes('onclick="createGC()"'), 'renderer must preserve the protected create callback wiring');
  assert.strictEqual(protectedSearchCalls, 0, 'renderer construction must not invoke protected member search');
  assert.strictEqual(protectedCreateCalls, 0, 'renderer construction must not invoke protected group creation');

  console.log('SHOW_GC_RENDERER_CONTRACT_HARNESS=PASS');
  console.log('MODAL_SETUP_MARKUP=PASS');
  console.log('SELECTION_RESET=PASS');
  console.log('CALLBACK_WIRING=PASS');
  console.log('PROTECTED_GROUP_ACTIONS_EXECUTED=0');
  console.log('PROTECTED_SIDE_EFFECTS=0');
  console.log('PRODUCTION_CHANGE=0');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
