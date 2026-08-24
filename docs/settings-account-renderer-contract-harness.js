'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'settings-account.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

for (const forbidden of [
  /\bdb\b|supabase|\.from\(|\.select\(|\.insert\(|\.update\(|\.delete\(|\.rpc\(/i,
  /fetch\s*\(|XMLHttpRequest|WebSocket/i,
  /localStorage|sessionStorage|indexedDB|document\.cookie/i,
  /navigator\.mediaDevices|MediaRecorder|RTCPeerConnection|upload\s*\(/i,
  /sendMsg\(|openChat\(|go\(|location\.|history\.|Notification|PushManager/i,
]) {
  assert(!forbidden.test(source), `account renderer must remain side-effect-free: ${forbidden}`);
}
assert(html.includes('src/features/settings-account.js'), 'account renderer must remain linked from HTML');
assert.strictEqual((source.match(/function showSettingsAccount\s*\(/g) || []).length, 1, 'renderer must have one global owner');

const body = { innerHTML: '' };
const events = [];
const iconCalls = [];
const context = {
  modal(title) {
    events.push(`modal:${title}`);
    return { querySelector(selector) { assert.strictEqual(selector, '#mbody'); return body; } };
  },
  ico(name, color, size) {
    iconCalls.push([name, color, size]);
    return `<svg data-synthetic-icon="${name}"></svg>`;
  },
};
vm.createContext(context);
vm.runInContext(source, context, { filename: 'settings-account.js' });
assert.strictEqual(typeof context.showSettingsAccount, 'function', 'renderer must remain globally callable');

context.showSettingsAccount();

assert.deepStrictEqual(events, ['modal:Account'], 'renderer must open the existing Account modal');
assert.strictEqual(iconCalls.length, 12, 'renderer must request six row icons and six chevrons');
assert.deepStrictEqual(iconCalls, [
  ['edit', '#FF2D7A', 18], ['chevron_right', '#555', 16],
  ['lock', '#FF2D7A', 18], ['chevron_right', '#555', 16],
  ['verified', '#FF2D7A', 18], ['chevron_right', '#555', 16],
  ['info', '#FF2D7A', 18], ['chevron_right', '#555', 16],
  ['download', '#FF2D7A', 18], ['chevron_right', '#555', 16],
  ['trash', '#FF2D7A', 18], ['chevron_right', '#FF2D7A', 16],
], 'renderer must preserve icon order, colors, and sizes');

const expectedRows = [
  ['showEditProfile', 'Edit Profile', 'Username, name, bio, website'],
  ['showPasswordReset', 'Password & Security', 'Reset password, 2FA, change email'],
  ['showVerificationApply', 'Verification', 'Apply for verified badge'],
  ['showAccountInfo', 'Account Information', 'User ID, email, member since'],
  ['downloadMyData', 'Download Data', 'Export your account data'],
  ['showDeleteAccount', 'Deactivate Account', 'Permanently delete your account'],
];
for (const [handler, label, copy] of expectedRows) {
  assert(body.innerHTML.includes(`onclick="${handler}()`), `renderer must preserve ${handler} launcher wiring`);
  assert(body.innerHTML.includes(label), `renderer must preserve ${label} label`);
  assert(body.innerHTML.includes(copy), `renderer must preserve ${label} explanatory copy`);
}
assert.strictEqual((body.innerHTML.match(/class="nova-setting-row"/g) || []).length, 6, 'renderer must preserve six account rows');
assert(!/showDeleteAccount\(\)\s*;?\s*[^<]*/.test(body.innerHTML.replace(/onclick="[^"]*"/g, '')), 'destructive launcher must remain only delegated markup');

console.log('SETTINGS_ACCOUNT_RENDERER_CONTRACT_HARNESS=PASS');
console.log('MODAL_ROWS_AND_COPY=6_PASS');
console.log('ICON_ORDER=12_PASS');
console.log('DELEGATED_ACCOUNT_LAUNCHERS=6_PASS');
console.log('PROTECTED_ACCOUNT_ACTIONS_EXECUTED=0');
console.log('PROTECTED_SIDE_EFFECTS=0');
console.log('PRODUCTION_CHANGE=0');
