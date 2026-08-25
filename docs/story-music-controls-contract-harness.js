'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'story-music-helpers.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

for (const forbidden of [
  /\bdb\b|supabase|\.from\(|\.select\(|\.insert\(|\.update\(|\.delete\(|\.rpc\(/i,
  /fetch\s*\(|XMLHttpRequest|WebSocket/i,
  /localStorage|sessionStorage|indexedDB|document\.cookie/i,
  /navigator\.mediaDevices|MediaRecorder|RTCPeerConnection|AudioContext|\.play\s*\(/i,
  /location\.|history\.|Notification|PushManager|upload\s*\(|storyEditorElements|renderStoryElements/i,
]) {
  assert(!forbidden.test(source), `music controls must remain local metadata/UI-only: ${forbidden}`);
}
assert(html.includes('src/features/story-music-helpers.js'), 'music controls must remain linked from HTML');
assert.strictEqual((source.match(/function seOpenMusicTool\s*\(/g) || []).length, 1, 'music opener must have one global owner');
assert.strictEqual((source.match(/function seCloseMusicPanel\s*\(/g) || []).length, 1, 'music closer must have one global owner');
assert.strictEqual((source.match(/function seSelectMusic\s*\(/g) || []).length, 1, 'music selector must have one global owner');
assert.strictEqual((source.match(/function removeStoryMusic\s*\(/g) || []).length, 1, 'music remover must have one global owner');

const panel = { style: { display: 'none' } };
const bar = { style: { display: 'none' } };
const info = { textContent: '' };
const events = [];
const context = {
  document: {
    getElementById(id) {
      if (id === 'se-music-panel') return panel;
      if (id === 'se-music-bar') return bar;
      if (id === 'se-music-info') return info;
      throw new Error(`unexpected element lookup: ${id}`);
    },
  },
  storyEditorMusic: null,
  toast(message) {
    events.push(`toast:${message}`);
  },
};
vm.createContext(context);
vm.runInContext(source, context, { filename: 'story-music-helpers.js' });
assert.strictEqual(typeof context.seOpenMusicTool, 'function', 'music opener must remain globally callable');
assert.strictEqual(typeof context.seCloseMusicPanel, 'function', 'music closer must remain globally callable');
assert.strictEqual(typeof context.seSelectMusic, 'function', 'music selector must remain globally callable');
assert.strictEqual(typeof context.removeStoryMusic, 'function', 'music remover must remain globally callable');

context.seOpenMusicTool();
assert.strictEqual(panel.style.display, 'block', 'music opener must show the picker');
context.seSelectMusic(2);
assert.strictEqual(context.storyEditorMusic.title, 'Midnight City', 'music selector must choose the requested static song');
assert.strictEqual(context.storyEditorMusic.artist, 'Neon Lights', 'music selector must preserve the selected artist');
assert.strictEqual(bar.style.display, 'flex', 'music selection must show the music bar');
assert.strictEqual(info.textContent, 'Midnight City — Neon Lights', 'music selection must update the local info label');
assert.strictEqual(panel.style.display, 'none', 'music selection must close the picker');
assert.deepStrictEqual(events, ['toast:Music added: Midnight City'], 'music selection must show the existing toast');

context.removeStoryMusic();
assert.strictEqual(context.storyEditorMusic, null, 'music removal must clear local music state');
assert.strictEqual(bar.style.display, 'none', 'music removal must hide the music bar');
assert.deepStrictEqual(events, ['toast:Music added: Midnight City'], 'music removal must not emit an extra external action');

console.log('STORY_MUSIC_CONTROLS_CONTRACT_HARNESS=PASS');
console.log('PANEL_OPEN_CLOSE_AND_SELECTION=PASS');
console.log('LOCAL_METADATA_AND_INFO=PASS');
console.log('REMOVAL_CLEANUP=PASS');
console.log('AUDIO_EXTERNAL_SIDE_EFFECTS=0');
console.log('PRODUCTION_CHANGE=0');
