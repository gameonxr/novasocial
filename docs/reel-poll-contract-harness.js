'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repo = path.resolve(__dirname, '..');
const sourcePath = path.join(repo, 'src', 'features', 'reel-poll.js');
const source = fs.readFileSync(sourcePath, 'utf8');

for (const forbidden of [
  /\bdb\b|supabase|\.from\(|\.select\(|\.insert\(|\.update\(|\.delete\(|\.rpc\(/i,
  /fetch\s*\(|XMLHttpRequest|WebSocket/i,
  /localStorage|sessionStorage|indexedDB|document\.cookie/i,
  /navigator\.mediaDevices|MediaRecorder|RTCPeerConnection/i,
  /location\.|history\.|goToProfile|viewPost|window\.open/i,
  /\bME\b|\bPROF\b|auth|upload|permission|Notification|PushManager/i,
]) {
  assert(!forbidden.test(source), `reel-poll helper must remain free of protected ownership: ${forbidden}`);
}

const fields = {
  'poll-q': { value: '' },
  'poll-o1': { value: '' },
  'poll-o2': { value: '' },
};
const body = { innerHTML: '' };
const events = [];
const context = {
  modal(title) {
    events.push(`modal:${title}`);
    return { querySelector(selector) { assert.strictEqual(selector, '#mbody'); return body; } };
  },
  document: {
    getElementById(id) {
      return fields[id] || null;
    },
  },
  toast(message) { events.push(`toast:${message}`); },
  closeModal() { events.push('modal.close'); },
};
vm.createContext(context);
vm.runInContext(source, context, { filename: 'reel-poll.js' });

assert.strictEqual(typeof context.showReelPoll, 'function', 'showReelPoll must remain globally callable');
assert.strictEqual(typeof context.saveReelPoll, 'function', 'saveReelPoll must remain globally callable');

context.showReelPoll('reel-7');
assert(events.includes('modal:📊 Interactive Poll'), 'showReelPoll must open the existing poll modal');
assert(body.innerHTML.includes('id="poll-q"'), 'poll question input must be rendered');
assert(body.innerHTML.includes('id="poll-o1"') && body.innerHTML.includes('id="poll-o2"'), 'both poll option inputs must be rendered');
assert(body.innerHTML.includes("saveReelPoll('reel-7')"), 'the existing reel id must remain wired into the save callback');

fields['poll-q'].value = '';
fields['poll-o1'].value = 'Option A';
fields['poll-o2'].value = 'Option B';
context.saveReelPoll('reel-7');
assert(events.includes('toast:Sab fields bharo'), 'missing question must emit validation feedback');
assert(!events.includes('modal.close'), 'validation must keep the modal open');

fields['poll-q'].value = 'Question';
fields['poll-o1'].value = '';
fields['poll-o2'].value = 'Option B';
context.saveReelPoll('reel-7');
assert(events.filter(event => event === 'toast:Sab fields bharo').length === 2, 'missing option must emit the same validation feedback');
assert(!events.includes('modal.close'), 'missing option must keep the modal open');

fields['poll-o1'].value = 'Option A';
context.saveReelPoll('reel-7');
assert(events.includes('toast:📊 Poll added to reel!'), 'complete poll must emit success feedback');
assert(events.includes('modal.close'), 'complete poll must close the modal');

console.log('REEL_POLL_CONTRACT_HARNESS=PASS');
console.log('MODAL_MARKUP_AND_CALLBACK=PASS');
console.log('VALIDATION_BRANCHES=QUESTION_AND_OPTION');
console.log('SUCCESS_CLOSE=PASS');
console.log('PROTECTED_SIDE_EFFECTS=0');
console.log('PRODUCTION_CHANGE=0');
