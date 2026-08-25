'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'video-length-options.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

for (const forbidden of [
  /\bdb\b|supabase|\.from\(|\.select\(|\.insert\(|\.update\(|\.delete\(|\.rpc\(/i,
  /fetch\s*\(|XMLHttpRequest|WebSocket/i,
  /localStorage|sessionStorage|indexedDB|document\.cookie/i,
  /navigator\.mediaDevices|MediaRecorder|RTCPeerConnection|upload\s*\(/i,
  /location\.|history\.|Notification|PushManager|play\s*\(|pause\s*\(/i,
]) {
  assert(!forbidden.test(source), `video-length renderer must remain local-only: ${forbidden}`);
}
assert(html.includes('src/features/video-length-options.js'), 'video-length renderer must remain linked from HTML');
assert.strictEqual((source.match(/function showVideoLengthOptions\s*\(/g) || []).length, 1, 'renderer must have one global owner');
assert(source.includes('[15,30,60,90,180]'), 'renderer must preserve the fixed duration preset list');
assert(source.includes('window._videoTrimTo=null'), 'renderer must preserve the standard-duration reset');
assert(source.includes('window._videoTrimTo=180'), 'renderer must preserve the long-duration default');

function makeNode(id) {
  return { id, innerHTML: '', style: { display: '' } };
}

function createContext(withNodes = true) {
  const nodes = new Map();
  if (withNodes) {
    nodes.set('vlenpick', makeNode('vlenpick'));
    nodes.set('vlen-opts', makeNode('vlen-opts'));
  }
  const events = [];
  const context = {
    window: { _videoTrimTo: 'stale' },
    MAX_VIDEO_LEN: 180,
    document: {
      getElementById(id) {
        return nodes.get(id) || null;
      },
    },
    toast(message) {
      events.push(`toast:${message}`);
    },
    selectVideoLen(value) {
      events.push(`select:${value}`);
    },
    setTimeout(callback, delay) {
      events.push(`timeout:${delay}`);
      callback();
      return 1;
    },
  };
  vm.createContext(context);
  vm.runInContext(source, context, { filename: 'video-length-options.js' });
  return { context, nodes, events };
}

(async () => {
  const standard = createContext();
  assert.strictEqual(typeof standard.context.showVideoLengthOptions, 'function', 'renderer must remain globally callable');
  const standardResult = standard.context.showVideoLengthOptions(75);
  assert.strictEqual(typeof standardResult, 'undefined', 'renderer must remain synchronously compatible');
  const standardMarkup = standard.nodes.get('vlen-opts').innerHTML;
  assert(standardMarkup.includes('data-s="15"'), 'standard duration must include the 15-second preset');
  assert(standardMarkup.includes('data-s="60"'), 'standard duration must include the 60-second preset');
  assert(!standardMarkup.includes('data-s="90"'), 'standard duration must exclude presets at or beyond the media duration');
  assert(standardMarkup.includes('data-s="full"'), 'standard duration must include the full-length option');
  assert(standardMarkup.includes('Full (75s)'), 'full-length markup must use the rounded duration');
  assert.strictEqual(standard.nodes.get('vlenpick').style.display, 'flex', 'standard duration must show the picker');
  assert.strictEqual(standard.context.window._videoTrimTo, null, 'standard duration must reset local trim state');
  assert.deepStrictEqual(standard.events, [], 'standard duration must not toast or invoke deferred selection');

  const long = createContext();
  long.context.showVideoLengthOptions(240);
  const longMarkup = long.nodes.get('vlen-opts').innerHTML;
  assert(longMarkup.includes('data-s="180"'), 'long duration must include the 180-second preset');
  assert(!longMarkup.includes('data-s="full"'), 'long duration must not expose an over-limit full-length option');
  assert.strictEqual(long.nodes.get('vlenpick').style.display, 'flex', 'long duration must show the picker');
  assert.strictEqual(long.context.window._videoTrimTo, 180, 'long duration must set the local 180-second default');
  assert.deepStrictEqual(long.events, ['toast:Video 3 min se lambi hai — length choose karo ✂️', 'timeout:0', 'select:180'], 'long duration must toast and delegate selection through the existing callback');

  const missing = createContext(false);
  missing.context.showVideoLengthOptions(240);
  assert.strictEqual(missing.context.window._videoTrimTo, 'stale', 'missing containers must not change local state');
  assert.deepStrictEqual(missing.events, [], 'missing containers must remain a no-op');

  console.log('VIDEO_LENGTH_OPTIONS_CONTRACT_HARNESS=PASS');
  console.log('PRESET_MARKUP_FILTERING=PASS');
  console.log('STANDARD_AND_LONG_DURATION_STATE=PASS');
  console.log('DEFERRED_SELECTION_DELEGATION=PASS');
  console.log('MISSING_CONTAINER_NOOP=PASS');
  console.log('MEDIA_SIDE_EFFECTS=0');
  console.log('PRODUCTION_CHANGE=0');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
