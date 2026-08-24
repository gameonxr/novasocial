'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'tog-gc.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

for (const forbidden of [
  /\bdb\b|supabase|\.from\(|\.select\(|\.insert\(|\.update\(|\.delete\(|\.rpc\(/i,
  /fetch\s*\(|XMLHttpRequest|WebSocket/i,
  /localStorage|sessionStorage|indexedDB|document\.cookie/i,
  /navigator\.mediaDevices|MediaRecorder|RTCPeerConnection|call|signal|invite|start/i,
  /sendMsg\(|openChat\(|go\(|location\.|history\.|Notification|PushManager/i,
]) {
  assert(!forbidden.test(source), `group-call selection helper must remain local-only: ${forbidden}`);
}
assert(html.includes('src/features/tog-gc.js'), 'group-call selection helper must remain linked from HTML');
assert.strictEqual((source.match(/function togGC\s*\(/g) || []).length, 1, 'helper must have one global owner');

const nodes = new Map();
const context = {
  _gcs: undefined,
  window: null,
  document: {
    getElementById(id) {
      return nodes.get(id) || null;
    },
  },
};
context.window = context;
vm.createContext(context);
vm.runInContext(source, context, { filename: 'tog-gc.js' });
assert.strictEqual(typeof context.togGC, 'function', 'helper must remain globally callable');

function node() {
  return { textContent: '', style: { background: '', borderColor: '' } };
}
const alice = node();
const bob = node();
nodes.set('gc-chk-alice', alice);
nodes.set('gc-chk-bob', bob);

context.togGC('alice', { synthetic: true });
assert.deepStrictEqual(Array.from(context._gcs), ['alice'], 'first toggle must add uid once');
assert.strictEqual(alice.textContent, '✓', 'selected checkbox must show a check');
assert.strictEqual(alice.style.background, '#E1306C', 'selected checkbox must use selected background');
assert.strictEqual(alice.style.borderColor, '#E1306C', 'selected checkbox must use selected border');

context.togGC('bob', { synthetic: true });
assert.deepStrictEqual(Array.from(context._gcs), ['alice', 'bob'], 'multiple toggles must preserve selection order');
assert.strictEqual(bob.textContent, '✓', 'second selected checkbox must show a check');

context.togGC('alice', { synthetic: true });
assert.deepStrictEqual(Array.from(context._gcs), ['bob'], 'second toggle must remove only the selected uid');
assert.strictEqual(alice.textContent, '', 'unselected checkbox must clear its check');
assert.strictEqual(alice.style.background, 'transparent', 'unselected checkbox must restore transparent background');
assert.strictEqual(alice.style.borderColor, '#333', 'unselected checkbox must restore default border');

assert.doesNotThrow(() => context.togGC('missing', { synthetic: true }), 'missing checkbox node must be tolerated');
assert.deepStrictEqual(Array.from(context._gcs), ['bob', 'missing'], 'missing checkbox toggle must still update local selection');

console.log('GROUP_CALL_SELECTION_CONTRACT_HARNESS=PASS');
console.log('ADD_REMOVE_ORDER=PASS');
console.log('CHECKBOX_STYLING=PASS');
console.log('MISSING_NODE_TOLERANCE=PASS');
console.log('PROTECTED_CALL_ACTIONS_EXECUTED=0');
console.log('PROTECTED_SIDE_EFFECTS=0');
console.log('PRODUCTION_CHANGE=0');
