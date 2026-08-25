'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repo = path.resolve(__dirname, '..');
const featureFiles = [
  'se-open-text-tool.js',
  'se-close-text-panel.js',
];
const sources = featureFiles.map(file => fs.readFileSync(path.join(repo, 'src', 'features', file), 'utf8'));
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

for (const source of sources) {
  for (const forbidden of [
    /\bdb\b|supabase|\.from\(|\.select\(|\.insert\(|\.update\(|\.delete\(|\.rpc\(/i,
    /fetch\s*\(|XMLHttpRequest|WebSocket/i,
    /localStorage|sessionStorage|indexedDB|document\.cookie/i,
    /navigator\.mediaDevices|MediaRecorder|RTCPeerConnection|upload\s*\(/i,
    /location\.|history\.|Notification|PushManager|storyEditorElements|renderStoryElements/i,
  ]) {
    assert(!forbidden.test(source), `text-panel controls must remain local UI-only: ${forbidden}`);
  }
}
for (const file of featureFiles) {
  assert(html.includes(`src/features/${file}`), `${file} must remain linked from HTML`);
}
assert.strictEqual((sources[0].match(/function seOpenTextTool\s*\(/g) || []).length, 1, 'open text control must have one global owner');
assert.strictEqual((sources[1].match(/function seCloseTextPanel\s*\(/g) || []).length, 1, 'close text control must have one global owner');

const panel = { style: { display: 'none' } };
const input = {
  focusCalls: 0,
  focus() { this.focusCalls += 1; },
};
const context = {
  document: {
    getElementById(id) {
      if (id === 'se-text-panel') return panel;
      if (id === 'se-text-input') return input;
      throw new Error(`unexpected element lookup: ${id}`);
    },
  },
  seEditingTextId: 'existing-text-id',
};
vm.createContext(context);
for (let i = 0; i < featureFiles.length; i += 1) {
  vm.runInContext(sources[i], context, { filename: featureFiles[i] });
}
assert.strictEqual(typeof context.seOpenTextTool, 'function', 'open text control must remain globally callable');
assert.strictEqual(typeof context.seCloseTextPanel, 'function', 'close text control must remain globally callable');

context.seOpenTextTool();
assert.strictEqual(panel.style.display, 'block', 'open text control must show the text panel');
assert.strictEqual(input.focusCalls, 1, 'open text control must focus the text input once');
assert.strictEqual(context.seEditingTextId, null, 'open text control must reset the editing id for new text');

context.seCloseTextPanel();
assert.strictEqual(panel.style.display, 'none', 'close text control must hide the text panel');
assert.strictEqual(input.focusCalls, 1, 'close text control must not focus or mutate the input');
assert.strictEqual(context.seEditingTextId, null, 'close text control must not change the editing id');

console.log('STORY_TEXT_PANEL_CONTROLS_CONTRACT_HARNESS=PASS');
console.log('OPEN_FOCUS_AND_NEW_ENTRY_RESET=PASS');
console.log('CLOSE_PANEL_STATE=PASS');
console.log('TEXT_ELEMENT_SIDE_EFFECTS=0');
console.log('PRODUCTION_CHANGE=0');
