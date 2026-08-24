'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'disappearing.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const start = source.indexOf('function showDisappearingOptions');
const end = source.indexOf('async function setDisappearing');
assert(start >= 0 && end > start, 'renderer and protected mutator boundaries must remain discoverable');
const renderer = source.slice(start, end);

for (const forbidden of [
  /\bdb\b|supabase|\.from\(|\.select\(|\.insert\(|\.update\(|\.delete\(|\.rpc\(/i,
  /fetch\s*\(|XMLHttpRequest|WebSocket/i,
  /localStorage|sessionStorage|indexedDB|document\.cookie/i,
  /navigator\.mediaDevices|MediaRecorder|RTCPeerConnection|upload\s*\(/i,
  /sendMsg\(|go\(|location\.|history\.|Notification|PushManager/i,
]) {
  assert(!forbidden.test(renderer), `renderer slice must remain read-only: ${forbidden}`);
}
assert(html.includes('src/features/disappearing.js'), 'disappearing module must remain linked from HTML');

const body = { innerHTML: '' };
const events = [];
const context = {
  modal(title) {
    events.push(`modal:${title}`);
    return { querySelector(selector) { assert.strictEqual(selector, '#mbody'); return body; } };
  },
};
vm.createContext(context);
vm.runInContext(renderer, context, { filename: 'disappearing-options-renderer.js' });
assert.strictEqual(typeof context.showDisappearingOptions, 'function', 'renderer must remain globally callable');
context.showDisappearingOptions('conversation-77');

assert.deepStrictEqual(events, ['modal:⏱️ Disappearing Messages'], 'renderer must open the existing modal title');
assert(body.innerHTML.includes('Messages automatically delete after the chosen time'), 'renderer must preserve explanatory copy');
const expected = [
  ['off', 'Off', '❌'],
  ['5s', '5 seconds', '⚡'],
  ['1m', '1 minute', '🕐'],
  ['1h', '1 hour', '⏰'],
  ['24h', '24 hours', '📅'],
  ['7d', '7 days', '📆'],
  ['90d', '90 days', '🗓️'],
];
for (const [value, label, icon] of expected) {
  assert(body.innerHTML.includes(`setDisappearing('conversation-77','${value}')`), `renderer must preserve callback value: ${value}`);
  assert(body.innerHTML.includes(`>${label}<`), `renderer must preserve option label: ${label}`);
  assert(body.innerHTML.includes(`>${icon}<`), `renderer must preserve option icon: ${icon}`);
}
assert.strictEqual((body.innerHTML.match(/onclick="setDisappearing\(/g) || []).length, 7, 'renderer must expose exactly seven delegated option handlers');
assert.strictEqual(typeof context.setDisappearing, 'undefined', 'protected persistence mutator must not be loaded by this renderer harness');

console.log('DISAPPEARING_OPTIONS_RENDERER_CONTRACT_HARNESS=PASS');
console.log('MODAL_AND_COPY=PASS');
console.log('OPTIONS_AND_CALLBACKS=7');
console.log('PROTECTED_MUTATOR_LOADED=0');
console.log('PROTECTED_SIDE_EFFECTS=0');
console.log('PRODUCTION_CHANGE=0');
