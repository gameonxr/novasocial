'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repo = path.resolve(__dirname, '..');
const featureFiles = [
  'se-open-draw-tool.js',
  'se-close-draw-panel.js',
  'se-select-draw-type.js',
  'se-select-draw-color.js',
];
const sources = featureFiles.map(file => fs.readFileSync(path.join(repo, 'src', 'features', file), 'utf8'));
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

for (const source of sources) {
  for (const forbidden of [
    /\bdb\b|supabase|\.from\(|\.select\(|\.insert\(|\.update\(|\.delete\(|\.rpc\(/i,
    /fetch\s*\(|XMLHttpRequest|WebSocket/i,
    /localStorage|sessionStorage|indexedDB|document\.cookie/i,
    /navigator\.mediaDevices|MediaRecorder|RTCPeerConnection|upload\s*\(/i,
    /location\.|history\.|Notification|PushManager|storyEditorUndoStack|storyEditorDrawCtx/i,
  ]) {
    assert(!forbidden.test(source), `draw controls must remain local UI-only: ${forbidden}`);
  }
}
for (const file of featureFiles) {
  assert(html.includes(`src/features/${file}`), `${file} must remain linked from HTML`);
}
assert.strictEqual((sources[0].match(/function seOpenDrawTool\s*\(/g) || []).length, 1, 'open control must have one global owner');
assert.strictEqual((sources[1].match(/function seCloseDrawPanel\s*\(/g) || []).length, 1, 'close control must have one global owner');
assert.strictEqual((sources[2].match(/function seSelectDrawType\s*\(/g) || []).length, 1, 'draw-type control must have one global owner');
assert.strictEqual((sources[3].match(/function seSelectDrawColor\s*\(/g) || []).length, 1, 'draw-color control must have one global owner');

function makeOption(type) {
  return {
    dataset: { type },
    style: { background: '', color: '' },
  };
}

function makeColorOption() {
  return { style: { borderColor: 'rgba(255,255,255,0.1)' } };
}

const panel = { style: { display: 'none' } };
const canvas = { style: { pointerEvents: 'none' } };
const options = [makeOption('pen'), makeOption('marker'), makeOption('eraser')];
const colorOptions = [makeColorOption(), makeColorOption(), makeColorOption()];
const context = {
  document: {
    getElementById(id) {
      if (id === 'se-draw-panel') return panel;
      throw new Error(`unexpected element lookup: ${id}`);
    },
    querySelectorAll(selector) {
      if (selector === '.se-draw-type') return options;
      if (selector === '.se-dcolor-opt') return colorOptions;
      throw new Error(`unexpected selector: ${selector}`);
    },
  },
  storyEditorDrawMode: false,
  storyEditorCanvas: canvas,
  storyEditorDrawType: 'pen',
  storyEditorDrawColor: '#000000',
  event: { target: colorOptions[0] },
};
vm.createContext(context);
for (let i = 0; i < featureFiles.length; i += 1) {
  vm.runInContext(sources[i], context, { filename: featureFiles[i] });
}
assert.strictEqual(typeof context.seOpenDrawTool, 'function', 'open control must remain globally callable');
assert.strictEqual(typeof context.seCloseDrawPanel, 'function', 'close control must remain globally callable');
assert.strictEqual(typeof context.seSelectDrawType, 'function', 'draw-type control must remain globally callable');
assert.strictEqual(typeof context.seSelectDrawColor, 'function', 'draw-color control must remain globally callable');

context.seOpenDrawTool();
assert.strictEqual(panel.style.display, 'block', 'open control must show the draw panel');
assert.strictEqual(context.storyEditorDrawMode, true, 'open control must enable draw mode');
assert.strictEqual(canvas.style.pointerEvents, 'auto', 'open control must enable canvas pointer events');

context.seSelectDrawType('marker');
assert.strictEqual(context.storyEditorDrawType, 'marker', 'draw-type control must set the local draw type');
assert.deepStrictEqual(options[0].style, { background: 'rgba(255,255,255,0.04)', color: '#8A8A8A' }, 'non-selected option must use inactive styling');
assert.deepStrictEqual(options[1].style, { background: 'linear-gradient(135deg,#FF2D7A,#833AB4)', color: '#fff' }, 'selected option must use active styling');
assert.deepStrictEqual(options[2].style, { background: 'rgba(255,255,255,0.04)', color: '#8A8A8A' }, 'other non-selected option must use inactive styling');

context.event = { target: colorOptions[1] };
context.seSelectDrawColor('#FF2D7A');
assert.strictEqual(context.storyEditorDrawColor, '#FF2D7A', 'draw-color control must set the local draw color');
assert.strictEqual(colorOptions[0].style.borderColor, 'rgba(255,255,255,0.1)', 'non-target color option must remain inactive');
assert.strictEqual(colorOptions[1].style.borderColor, '#FF2D7A', 'event target must receive the active border color');
assert.strictEqual(colorOptions[2].style.borderColor, 'rgba(255,255,255,0.1)', 'other color option must remain inactive');

context.seCloseDrawPanel();
assert.strictEqual(panel.style.display, 'none', 'close control must hide the draw panel');
assert.strictEqual(context.storyEditorDrawMode, false, 'close control must disable draw mode');
assert.strictEqual(canvas.style.pointerEvents, 'none', 'close control must disable canvas pointer events');

const missingContext = {
  document: { getElementById() { return null; } },
  storyEditorDrawMode: false,
  storyEditorCanvas: canvas,
};
vm.createContext(missingContext);
vm.runInContext(sources[0], missingContext, { filename: featureFiles[0] });
let missingError = null;
try {
  missingContext.seOpenDrawTool();
} catch (error) {
  missingError = error;
}
assert(missingError, 'open control must retain its existing required-panel behavior');

console.log('STORY_DRAW_CONTROLS_CONTRACT_HARNESS=PASS');
console.log('OPEN_CLOSE_PANEL_STATE=PASS');
console.log('DRAW_TYPE_STYLING=PASS');
console.log('DRAW_COLOR_STYLING=PASS');
console.log('MISSING_PANEL_BEHAVIOR=PASS');
console.log('CANVAS_HISTORY_SIDE_EFFECTS=0');
console.log('PRODUCTION_CHANGE=0');
