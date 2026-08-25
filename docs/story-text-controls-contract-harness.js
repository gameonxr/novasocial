'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repo = path.resolve(__dirname, '..');
const featureFiles = [
  'se-select-text-color.js',
  'se-select-font.js',
  'se-toggle-gradient-text.js',
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
    assert(!forbidden.test(source), `text controls must remain local UI-only: ${forbidden}`);
  }
}
for (const file of featureFiles) {
  assert(html.includes(`src/features/${file}`), `${file} must remain linked from HTML`);
}
assert.strictEqual((sources[0].match(/function seSelectTextColor\s*\(/g) || []).length, 1, 'text-color control must have one global owner');
assert.strictEqual((sources[1].match(/function seSelectFont\s*\(/g) || []).length, 1, 'font control must have one global owner');
assert.strictEqual((sources[2].match(/function seToggleGradientText\s*\(/g) || []).length, 1, 'gradient control must have one global owner');

function makeColorOption() {
  return { style: { borderColor: 'rgba(255,255,255,0.1)' } };
}
function makeFontOption() {
  return { style: { background: '', color: '' } };
}

const colorOptions = [makeColorOption(), makeColorOption(), makeColorOption()];
const fontOptions = [makeFontOption(), makeFontOption(), makeFontOption()];
const events = [];
const context = {
  document: {
    querySelectorAll(selector) {
      if (selector === '.se-color-opt') return colorOptions;
      if (selector === '.se-font-opt') return fontOptions;
      throw new Error(`unexpected selector: ${selector}`);
    },
  },
  event: { target: colorOptions[0] },
  seCurrentTextColor: '#FFFFFF',
  seCurrentFont: 0,
  seGradientText: true,
  toast(message) {
    events.push(`toast:${message}`);
  },
};
vm.createContext(context);
for (let i = 0; i < featureFiles.length; i += 1) {
  vm.runInContext(sources[i], context, { filename: featureFiles[i] });
}
assert.strictEqual(typeof context.seSelectTextColor, 'function', 'text-color control must remain globally callable');
assert.strictEqual(typeof context.seSelectFont, 'function', 'font control must remain globally callable');
assert.strictEqual(typeof context.seToggleGradientText, 'function', 'gradient control must remain globally callable');

context.event = { target: colorOptions[1] };
context.seSelectTextColor('#00E5FF');
assert.strictEqual(context.seCurrentTextColor, '#00E5FF', 'text-color control must set local color');
assert.strictEqual(context.seGradientText, false, 'text-color selection must disable gradient mode');
assert.strictEqual(colorOptions[0].style.borderColor, 'rgba(255,255,255,0.1)', 'non-target color option must remain inactive');
assert.strictEqual(colorOptions[1].style.borderColor, '#FF2D7A', 'color event target must receive active styling');
assert.strictEqual(colorOptions[2].style.borderColor, 'rgba(255,255,255,0.1)', 'other color option must remain inactive');

context.seSelectFont(2);
assert.strictEqual(context.seCurrentFont, 2, 'font control must set local font');
assert.deepStrictEqual(fontOptions[0].style, { background: 'rgba(255,255,255,0.04)', color: '#8A8A8A' }, 'non-selected font must use inactive styling');
assert.deepStrictEqual(fontOptions[1].style, { background: 'rgba(255,255,255,0.04)', color: '#8A8A8A' }, 'other non-selected font must use inactive styling');
assert.deepStrictEqual(fontOptions[2].style, { background: 'linear-gradient(135deg,#FF2D7A,#833AB4)', color: '#fff' }, 'selected font must use active styling');

context.seToggleGradientText();
assert.strictEqual(context.seGradientText, true, 'gradient control must enable gradient mode');
assert.deepStrictEqual(events, ['toast:Gradient text ON'], 'gradient enable must show the existing toast');
context.seToggleGradientText();
assert.strictEqual(context.seGradientText, false, 'gradient control must disable gradient mode');
assert.deepStrictEqual(events, ['toast:Gradient text ON'], 'gradient disable must not show an enable toast');

console.log('STORY_TEXT_CONTROLS_CONTRACT_HARNESS=PASS');
console.log('TEXT_COLOR_STATE_AND_BORDER=PASS');
console.log('FONT_STATE_AND_STYLING=PASS');
console.log('GRADIENT_TOGGLE_TOAST=PASS');
console.log('TEXT_PERSISTENCE_SIDE_EFFECTS=0');
console.log('PRODUCTION_CHANGE=0');
