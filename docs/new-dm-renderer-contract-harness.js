'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'show-new-dm.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

for (const forbidden of [
  /\bdb\b|supabase|\.from\(|\.select\(|\.insert\(|\.update\(|\.delete\(|\.rpc\(/i,
  /fetch\s*\(|XMLHttpRequest|WebSocket/i,
  /localStorage|sessionStorage|indexedDB|document\.cookie/i,
  /navigator\.mediaDevices|MediaRecorder|RTCPeerConnection|upload\s*\(/i,
  /sendMsg\(|openChat\(|go\(|location\.|history\.|Notification|PushManager/i,
]) {
  assert(!forbidden.test(source), `new-DM renderer must remain side-effect-free: ${forbidden}`);
}
assert(html.includes('src/features/show-new-dm.js'), 'new-DM renderer must remain linked from HTML');
assert.strictEqual((source.match(/async function showNewDM\s*\(/g) || []).length, 1, 'renderer must have one global owner');

const body = { innerHTML: '' };
const events = [];
let iconCalls = 0;
let protectedSearchCalls = 0;
const context = {
  modal(title) {
    events.push(`modal:${title}`);
    return { querySelector(selector) { assert.strictEqual(selector, '#mbody'); return body; } };
  },
  ico(name, color, size) {
    iconCalls += 1;
    assert.deepStrictEqual([name, color, size], ['search', '#666', 18], 'renderer must request the existing search icon');
    return '<svg data-synthetic-icon="search"></svg>';
  },
  searchDM() {
    protectedSearchCalls += 1;
  },
};
vm.createContext(context);
vm.runInContext(source, context, { filename: 'show-new-dm.js' });
assert.strictEqual(typeof context.showNewDM, 'function', 'renderer must remain globally callable');

(async () => {
  const result = context.showNewDM();
  assert.strictEqual(typeof result.then, 'function', 'async-compatible renderer return must remain available');
  await result;

  assert.deepStrictEqual(events, ['modal:New Message'], 'renderer must open the existing New Message modal');
  assert.strictEqual(iconCalls, 1, 'renderer must request one search icon');
  assert(body.innerHTML.includes('Username search karo...'), 'renderer must preserve the username-search placeholder');
  assert(body.innerHTML.includes('id="dms-inp"'), 'renderer must preserve the DM search input id');
  assert(body.innerHTML.includes('id="dms-res"'), 'renderer must preserve the DM results id');
  assert(body.innerHTML.includes('oninput="searchDM(this.value)"'), 'renderer must preserve the delegated search callback wiring');
  assert.strictEqual(protectedSearchCalls, 0, 'renderer construction must not invoke protected DM search');

  console.log('NEW_DM_RENDERER_CONTRACT_HARNESS=PASS');
  console.log('MODAL_SEARCH_MARKUP=PASS');
  console.log('CALLBACK_WIRING=PASS');
  console.log('PROTECTED_DM_ACTIONS_EXECUTED=0');
  console.log('PROTECTED_SIDE_EFFECTS=0');
  console.log('PRODUCTION_CHANGE=0');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
