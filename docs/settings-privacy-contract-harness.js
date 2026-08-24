'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'settings-privacy.js'), 'utf8');

for (const forbidden of [
  /\bdb\b|supabase|\.from\(|\.select\(|\.insert\(|\.update\(|\.delete\(|\.rpc\(/i,
  /fetch\s*\(|XMLHttpRequest|WebSocket/i,
  /localStorage|sessionStorage|indexedDB|document\.cookie/i,
  /navigator\.mediaDevices|MediaRecorder|RTCPeerConnection|upload\s*\(/i,
  /sendMsg\(|go\(|location\.|history\.|Notification|PushManager/i,
]) {
  assert(!forbidden.test(source), `settings privacy renderer must remain non-mutating: ${forbidden}`);
}

function run(prof) {
  const body = { innerHTML: '' };
  const events = [];
  const context = {
    ME: { id: 'account-privacy-7' },
    PROF: prof,
    modal(title) {
      events.push(`modal:${title}`);
      return { querySelector(selector) { assert.strictEqual(selector, '#mbody'); return body; } };
    },
    ico(name, color, size) {
      events.push(`ico:${name}:${color}:${size}`);
      return `<i data-icon="${name}"></i>`;
    },
    toast(message) { events.push(`toast:${message}`); },
  };
  vm.createContext(context);
  vm.runInContext(source, context, { filename: 'settings-privacy.js' });
  assert.strictEqual(typeof context.showSettingsPrivacy, 'function', 'showSettingsPrivacy must remain globally callable');
  context.showSettingsPrivacy();
  return { body, events };
}

const enabled = run({ ghost_mode: true, read_receipts_enabled: true, is_private: true });
assert.strictEqual(enabled.events[0], 'modal:Privacy', 'renderer must open the Privacy modal');
assert.strictEqual(enabled.events.filter(event => event.startsWith('ico:')).length, 11, 'renderer must request the seven row icons and four existing chevrons');
for (const label of ['Ghost Mode', 'Read Receipts', 'Private Account', 'Blocked Users', 'Close Friends', 'Story Privacy', 'Message Privacy']) {
  assert(enabled.body.innerHTML.includes(`>${label}<`), `privacy row must preserve label: ${label}`);
}
assert(enabled.body.innerHTML.includes('color:#3db83d') && enabled.body.innerHTML.includes('>ON<'), 'enabled profile flags must render active status');
assert(enabled.body.innerHTML.includes("showDisappearingOptions('account-privacy-7')"), 'Story Privacy must preserve the current account-id callback argument');
assert(enabled.body.innerHTML.includes('toggleGhostMode()') && enabled.body.innerHTML.includes('toggleReadReceipts()'), 'privacy toggles must preserve inline callback wiring');
assert(enabled.body.innerHTML.includes('showPrivateAccount()') && enabled.body.innerHTML.includes('showBlockedList()'), 'account/privacy callbacks must remain delegated');
assert(enabled.body.innerHTML.includes('showCloseFriendsManager()') && enabled.body.innerHTML.includes("toast('Message privacy settings')"), 'close-friends and message-privacy callbacks must remain delegated');
assert.strictEqual(enabled.events.filter(event => event.startsWith('toast:')).length, 0, 'row actions must not execute while rendering');

const disabled = run({ ghost_mode: false, read_receipts_enabled: false, is_private: false });
assert(disabled.body.innerHTML.includes('color:#555') && disabled.body.innerHTML.includes('>OFF<'), 'disabled profile flags must render inactive status');
const defaultReceipts = run({ ghost_mode: false, is_private: false });
assert(defaultReceipts.body.innerHTML.includes('color:#3db83d') && defaultReceipts.body.innerHTML.includes('>ON<'), 'missing read-receipts flag must preserve the existing enabled default');

console.log('SETTINGS_PRIVACY_CONTRACT_HARNESS=PASS');
console.log('MODAL_ROWS_AND_ICON_COUNT=PASS');
console.log('STATUS_FLAG_BRANCHES=PASS');
console.log('DELEGATION_AND_ACCOUNT_ID=PASS');
console.log('DELEGATED_ACTIONS_EXECUTED=0');
console.log('PROTECTED_SIDE_EFFECTS=0');
console.log('PRODUCTION_CHANGE=0');
