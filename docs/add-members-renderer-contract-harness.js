'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'show-add-members.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

for (const forbidden of [
  /\bdb\b|supabase|\.from\(|\.select\(|\.insert\(|\.update\(|\.delete\(|\.rpc\(/i,
  /fetch\s*\(|XMLHttpRequest|WebSocket/i,
  /localStorage|sessionStorage|indexedDB|document\.cookie/i,
  /navigator\.mediaDevices|MediaRecorder|RTCPeerConnection|upload\s*\(/i,
  /sendMsg\(|go\(|location\.|history\.|Notification|PushManager|addMemberToGroup/i,
]) {
  assert(!forbidden.test(source), `add-members renderer must remain side-effect-free: ${forbidden}`);
}
assert(html.includes('src/features/show-add-members.js'), 'add-members renderer must remain linked from HTML');
assert.strictEqual((source.match(/async function showAddMembers\s*\(/g) || []).length, 1, 'renderer must have one global owner');

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
  searchAddMembers() {
    protectedSearchCalls += 1;
  },
};
vm.createContext(context);
vm.runInContext(source, context, { filename: 'show-add-members.js' });
assert.strictEqual(typeof context.showAddMembers, 'function', 'renderer must remain globally callable');

(async () => {
  const result = context.showAddMembers('group-42');
  assert.strictEqual(typeof result.then, 'function', 'async-compatible renderer return must remain available');
  await result;

  assert.deepStrictEqual(events, ['modal:Add Members'], 'renderer must open the existing Add Members modal');
  assert.strictEqual(iconCalls, 1, 'renderer must request one search icon');
  assert(body.innerHTML.includes('Search users by username...'), 'renderer must preserve the user-search placeholder');
  assert(body.innerHTML.includes('id="am-search"'), 'renderer must preserve the search input id');
  assert(body.innerHTML.includes('id="am-results"'), 'renderer must preserve the result container id');
  assert(body.innerHTML.includes('oninput="searchAddMembers(\'group-42\',this.value)"'), 'renderer must preserve the conversation id callback wiring');
  assert.strictEqual(protectedSearchCalls, 0, 'renderer construction must not invoke protected member search');

  console.log('ADD_MEMBERS_RENDERER_CONTRACT_HARNESS=PASS');
  console.log('MODAL_SEARCH_MARKUP=PASS');
  console.log('CALLBACK_INTERPOLATION=PASS');
  console.log('PROTECTED_MEMBER_ACTIONS_EXECUTED=0');
  console.log('PROTECTED_SIDE_EFFECTS=0');
  console.log('PRODUCTION_CHANGE=0');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
