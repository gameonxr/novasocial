'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'story-background-helpers.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

for (const forbidden of [
  /\bdb\b|supabase|\.from\(|\.select\(|\.insert\(|\.update\(|\.delete\(|\.rpc\(/i,
  /fetch\s*\(|XMLHttpRequest|WebSocket/i,
  /localStorage|sessionStorage|indexedDB|document\.cookie/i,
  /navigator\.mediaDevices|MediaRecorder|RTCPeerConnection|upload\s*\(/i,
  /location\.|history\.|Notification|PushManager|storyEditorElements|renderStoryElements/i,
]) {
  assert(!forbidden.test(source), `background controls must remain local UI-only: ${forbidden}`);
}
assert(html.includes('src/features/story-background-helpers.js'), 'background controls must remain linked from HTML');
assert.strictEqual((source.match(/function seOpenBgTool\s*\(/g) || []).length, 1, 'background opener must have one global owner');
assert.strictEqual((source.match(/function seCloseBgPanel\s*\(/g) || []).length, 1, 'background closer must have one global owner');
assert.strictEqual((source.match(/function seSelectBg\s*\(/g) || []).length, 1, 'background selector must have one global owner');

function makeOption() {
  return { style: { borderColor: 'rgba(255,255,255,0.1)' } };
}

const panel = { style: { display: 'none' } };
const overlay = { style: { background: 'initial' } };
const options = [makeOption(), makeOption(), makeOption()];
const context = {
  document: {
    getElementById(id) {
      if (id === 'se-bg-panel') return panel;
      if (id === 'se-bg-overlay') return overlay;
      throw new Error(`unexpected element lookup: ${id}`);
    },
    querySelectorAll(selector) {
      assert.strictEqual(selector, '.se-bg-opt');
      return options;
    },
  },
  storyEditorBg: 'initial',
};
vm.createContext(context);
vm.runInContext(source, context, { filename: 'story-background-helpers.js' });
assert.strictEqual(typeof context.seOpenBgTool, 'function', 'background opener must remain globally callable');
assert.strictEqual(typeof context.seCloseBgPanel, 'function', 'background closer must remain globally callable');
assert.strictEqual(typeof context.seSelectBg, 'function', 'background selector must remain globally callable');

context.seOpenBgTool();
assert.strictEqual(panel.style.display, 'block', 'background opener must show the panel');
context.seSelectBg('linear-gradient(135deg,#FF2D7A,#00E5FF)', 1);
assert.strictEqual(context.storyEditorBg, 'linear-gradient(135deg,#FF2D7A,#00E5FF)', 'background selector must set local gradient state');
assert.strictEqual(overlay.style.background, 'linear-gradient(135deg,#FF2D7A,#00E5FF)', 'background selector must apply the gradient to the overlay');
assert.strictEqual(options[0].style.borderColor, 'rgba(255,255,255,0.1)', 'non-selected background option must remain inactive');
assert.strictEqual(options[1].style.borderColor, '#FF2D7A', 'selected background option must receive active styling');
assert.strictEqual(options[2].style.borderColor, 'rgba(255,255,255,0.1)', 'other background option must remain inactive');
assert.strictEqual(panel.style.display, 'none', 'background selection must close the panel');

context.seOpenBgTool();
assert.strictEqual(panel.style.display, 'block', 'background opener must reopen the panel');
context.seCloseBgPanel();
assert.strictEqual(panel.style.display, 'none', 'background closer must hide the panel');

console.log('STORY_BACKGROUND_CONTROLS_CONTRACT_HARNESS=PASS');
console.log('PANEL_OPEN_CLOSE_STATE=PASS');
console.log('GRADIENT_ASSIGNMENT_AND_OVERLAY=PASS');
console.log('OPTION_BORDER_STYLING=PASS');
console.log('PERSISTENCE_MEDIA_SIDE_EFFECTS=0');
console.log('PRODUCTION_CHANGE=0');
