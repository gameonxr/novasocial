'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repo = path.resolve(__dirname, '..');
const sourcePath = path.join(repo, 'src', 'features', 'setup-segment-drag-window.js');
const source = fs.readFileSync(sourcePath, 'utf8');

for (const forbidden of [
  /\bdb\b|supabase|\.from\(|\.select\(|\.insert\(|\.update\(|\.delete\(|\.rpc\(/i,
  /fetch\s*\(|XMLHttpRequest|WebSocket/i,
  /localStorage|sessionStorage|indexedDB|document\.cookie/i,
  /\bME\b|\bPROF\b|sendMsg\(|go\(|location\.|history\./i,
  /navigator\.mediaDevices|MediaRecorder|RTCPeerConnection|upload|Notification|PushManager/i,
]) {
  assert(!forbidden.test(source), `segment drag-window helper must remain local UI scope: ${forbidden}`);
}

function makeNode() {
  return {
    style: { left: '0%', cursor: 'grab' },
    offsetWidth: 200,
    textContent: '',
    listeners: Object.create(null),
    addEventListener(type, handler, options) {
      this.listeners[type] = { handler, options };
    },
  };
}

const track = makeNode();
const win = makeNode();
const label = makeNode();
const nodes = {
  'waveform-track': track,
  'drag-window': win,
  'segment-time-label': label,
};
const audio = { paused: false, currentTime: 99 };
const context = {
  window: { _segmentStartSec: null },
  _segmentAudio: audio,
  document: { getElementById(id) { return nodes[id] || null; } },
};
vm.createContext(context);
vm.runInContext(source, context, { filename: 'setup-segment-drag-window.js' });
assert.strictEqual(typeof context.setupSegmentDragWindow, 'function', 'setupSegmentDragWindow must remain globally callable');

context.setupSegmentDragWindow('synthetic-preview-url');
assert.strictEqual(win.style.left, '0%', 'initial selection must start at zero');
assert.strictEqual(context.window._segmentStartSec, 0, 'initial segment start must be zero');
assert.strictEqual(label.textContent, '0:00 - 0:08', 'initial label must show the fixed eight-second window');
assert.strictEqual(audio.currentTime, 0, 'playing local preview must seek to the initial segment start');
assert(win.listeners.touchstart && win.listeners.touchmove && win.listeners.touchend, 'all touch lifecycle listeners must be installed');

let prevented = false;
win.listeners.touchstart.handler({ touches: [{ clientX: 100 }] });
assert.strictEqual(win.style.cursor, 'grabbing', 'touchstart must change the cursor to grabbing');
win.listeners.touchmove.handler({
  touches: [{ clientX: 200 }],
  preventDefault() { prevented = true; },
});
assert.strictEqual(prevented, true, 'dragging touchmove must prevent the browser default');
assert.strictEqual(win.style.left, '50%', 'midpoint drag must use track-relative percentage');
assert.strictEqual(context.window._segmentStartSec, 15, 'midpoint drag must round to the corresponding start second');
assert.strictEqual(label.textContent, '0:15 - 0:23', 'midpoint drag must update the time label');
assert.strictEqual(audio.currentTime, 15, 'playing local preview must seek with the selected start');
win.listeners.touchend.handler();
assert.strictEqual(win.style.cursor, 'grab', 'touchend must restore the grab cursor');

win.listeners.touchstart.handler({ touches: [{ clientX: 100 }] });
win.listeners.touchmove.handler({ touches: [{ clientX: -100 }], preventDefault() {} });
assert.strictEqual(win.style.left, '0%', 'negative drag must clamp to zero');
assert.strictEqual(context.window._segmentStartSec, 0, 'lower clamp must reset the start second');

win.listeners.touchstart.handler({ touches: [{ clientX: 0 }] });
win.listeners.touchmove.handler({ touches: [{ clientX: 1000 }], preventDefault() {} });
assert.strictEqual(win.style.left, '73.33333333333333%', 'large drag must clamp to the maximum legal left edge');
assert.strictEqual(context.window._segmentStartSec, 22, 'upper clamp must select the final legal eight-second window');
assert.strictEqual(label.textContent, '0:22 - 0:30', 'upper clamp must update the final time label');
assert.strictEqual(audio.currentTime, 22, 'upper-clamped selection must seek the local preview');

const pausedAudio = { paused: true, currentTime: 4 };
context._segmentAudio = pausedAudio;
win.listeners.touchstart.handler({ touches: [{ clientX: 0 }] });
win.listeners.touchmove.handler({ touches: [{ clientX: 100 }], preventDefault() {} });
assert.strictEqual(pausedAudio.currentTime, 4, 'paused local preview must not be sought');

const missingContext = {
  window: {},
  _segmentAudio: { paused: true, currentTime: 0 },
  document: { getElementById() { return null; } },
};
vm.createContext(missingContext);
vm.runInContext(source, missingContext, { filename: 'setup-segment-drag-window-missing.js' });
assert.doesNotThrow(() => missingContext.setupSegmentDragWindow('unused'), 'missing picker nodes must be tolerated');

console.log('SEGMENT_DRAG_WINDOW_CONTRACT_HARNESS=PASS');
console.log('INITIALIZATION_AND_LABEL=PASS');
console.log('MIDPOINT_AND_CLAMPING=PASS');
console.log('PREVIEW_SEEK_POLICY=PASS');
console.log('TOUCH_LIFECYCLE=PASS');
console.log('MISSING_NODE_TOLERANCE=PASS');
console.log('PROTECTED_SIDE_EFFECTS=0');
console.log('PRODUCTION_CHANGE=0');
