'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'like-effects.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

for (const forbidden of [
  /\bdb\b|supabase|\.from\(|\.select\(|\.insert\(|\.update\(|\.delete\(|\.rpc\(/i,
  /fetch\s*\(|XMLHttpRequest|WebSocket/i,
  /localStorage|sessionStorage|indexedDB|document\.cookie/i,
  /navigator\.mediaDevices|MediaRecorder|RTCPeerConnection|upload\s*\(/i,
  /\bME\b|\bPROF\b|sendMsg\(|go\(|location\.|history\.|Notification|PushManager/i,
]) {
  assert(!forbidden.test(source), `like effects module must not own protected persistence: ${forbidden}`);
}
assert(html.includes('src/features/like-effects.js'), 'like-effects module must remain linked from HTML');

function makeClassList() {
  return {
    classes: new Set(['show']),
    contains(name) { return this.classes.has(name); },
    remove(name) { this.classes.delete(name); },
  };
}
function makeNode(id) {
  return {
    id,
    dataset: { liked: 'false' },
    classList: makeClassList(),
    contains(target) { return target === this; },
  };
}

const button = makeNode('lbtn-post-7');
const panel = makeNode('theme-panel');
const fab = makeNode('theme-picker-fab');
const documentListeners = {};
const calls = [];
const particles = [];
const originalToggle = function (pid, extra) {
  calls.push({ receiver: this, args: [pid, extra] });
  button.dataset.liked = pid === 'like-me' ? 'true' : 'false';
  return 'protected-result';
};
const context = {
  window: { toggleLike: originalToggle },
  document: {
    getElementById(id) { return id === 'lbtn-like-me' || id === 'lbtn-unlike-me' ? button : id === panel.id ? panel : null; },
    querySelector(selector) { return selector === '.theme-picker-fab' ? fab : null; },
    addEventListener(type, handler) { documentListeners[type] = handler; },
  },
  spawnLikeParticles(el) { particles.push(el); },
};
vm.createContext(context);
vm.runInContext(source, context, { filename: 'like-effects.js' });
assert.strictEqual(typeof context.window.toggleLike, 'function', 'wrapped toggleLike must remain globally callable');
assert.strictEqual(typeof documentListeners.click, 'function', 'theme-panel click cleanup listener must be registered');

async function main() {
const receiver = { marker: 'caller-receiver' };
const likeResult = context.window.toggleLike.call(receiver, 'like-me', { synthetic: true });
assert.strictEqual(typeof likeResult.then, 'function', 'wrapper must preserve async-compatible return behavior');
await likeResult;
assert.strictEqual(calls.length, 1, 'protected original toggle must be delegated once');
assert.strictEqual(calls[0].receiver, receiver, 'wrapper must preserve the caller receiver');
assert.deepStrictEqual(calls[0].args, ['like-me', { synthetic: true }], 'wrapper must preserve original arguments');
assert.strictEqual(particles.length, 1, 'false-to-true like transition must spawn one particle effect');
assert.strictEqual(particles[0], button, 'particle effect must target the like button');

button.dataset.liked = 'true';
const unlikeResult = context.window.toggleLike('unlike-me');
assert.strictEqual(typeof unlikeResult.then, 'function', 'unlike wrapper must remain async-compatible');
await unlikeResult;
assert.strictEqual(calls.length, 2, 'unlike must delegate the protected original once');
assert.strictEqual(particles.length, 1, 'true-to-false transition must not spawn particles');

panel.classList.classes.add('show');
const insidePanel = { marker: 'inside-panel' };
panel.contains = target => target === insidePanel;
documentListeners.click({ target: insidePanel });
assert.strictEqual(panel.classList.contains('show'), true, 'inside-panel click must keep the panel open');

panel.classList.classes.add('show');
const insideFab = { marker: 'inside-fab' };
fab.contains = target => target === insideFab;
documentListeners.click({ target: insideFab });
assert.strictEqual(panel.classList.contains('show'), true, 'inside-FAB click must keep the panel open');

documentListeners.click({ target: { marker: 'outside' } });
assert.strictEqual(panel.classList.contains('show'), false, 'outside click must remove the panel show class');

console.log('LIKE_EFFECTS_CONTRACT_HARNESS=PASS');
console.log('PROTECTED_TOGGLE_DELEGATION=PASS');
console.log('LIKE_ONLY_PARTICLE_GATING=PASS');
console.log('THEME_OUTSIDE_CLICK_CLEANUP=PASS');
console.log('PROTECTED_SIDE_EFFECTS=0');
console.log('PRODUCTION_CHANGE=0');
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
