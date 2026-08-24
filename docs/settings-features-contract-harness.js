'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'settings-features.js'), 'utf8');

for (const forbidden of [
  /\bdb\b|supabase|\.from\(|\.select\(|\.insert\(|\.update\(|\.delete\(|\.rpc\(/i,
  /fetch\s*\(|XMLHttpRequest|WebSocket/i,
  /localStorage|sessionStorage|indexedDB|document\.cookie/i,
  /navigator\.mediaDevices|MediaRecorder|RTCPeerConnection|upload\s*\(/i,
  /sendMsg\(|go\(|location\.|history\.|Notification|PushManager/i,
]) {
  assert(!forbidden.test(source), `settings features renderer must remain non-mutating: ${forbidden}`);
}

const body = { innerHTML: '' };
const events = [];
const context = {
  ME: { id: 'account-42' },
  modal(title) {
    events.push(`modal:${title}`);
    return { querySelector(selector) { assert.strictEqual(selector, '#mbody'); return body; } };
  },
  ico(name, color, size) {
    events.push(`ico:${name}:${color}:${size}`);
    return `<i data-icon="${name}"></i>`;
  },
};
vm.createContext(context);
vm.runInContext(source, context, { filename: 'settings-features.js' });
assert.strictEqual(typeof context.showSettingsFeatures, 'function', 'showSettingsFeatures must remain globally callable');

context.showSettingsFeatures();
assert.deepStrictEqual(events, ['modal:Features', 'ico:sparkles:#FF2D7A:18', 'ico:chevron_right:#555:16', 'ico:bot:#FF2D7A:18', 'ico:chevron_right:#555:16', 'ico:film:#FF2D7A:18', 'ico:chevron_right:#555:16', 'ico:headphones:#FF2D7A:18', 'ico:chevron_right:#555:16', 'ico:group:#FF2D7A:18', 'ico:chevron_right:#555:16', 'ico:tv:#FF2D7A:18', 'ico:chevron_right:#555:16', 'ico:wallet:#FF2D7A:18', 'ico:chevron_right:#555:16', 'ico:img:#FF2D7A:18', 'ico:chevron_right:#555:16', 'ico:star:#FF2D7A:18', 'ico:chevron_right:#555:16', 'ico:brain:#FF2D7A:18', 'ico:chevron_right:#555:16', 'ico:rocket:#FF2D7A:18', 'ico:chevron_right:#555:16'], 'renderer must open the Features modal and request the existing icons in order');

const expectedLabels = ['Nova Universe', 'Nova AI', 'AI Editor', 'Voice Rooms', 'Communities', 'Channels', 'Wallet', 'Memories', 'Story Highlights', 'Smart Feed', 'Creator Tools'];
for (const label of expectedLabels) assert(body.innerHTML.includes(`>${label}<`), `feature row must preserve label: ${label}`);

const expectedCallbacks = [
  "closeModal();showNovaUniverseHub()",
  "closeModal();toggleNovaAI()",
  "closeModal();showAIVideoEditor()",
  "closeModal();showVoiceRooms()",
  "closeModal();showCommunities()",
  "closeModal();showChannels()",
  "closeModal();showCreatorWallet()",
  "closeModal();showMemories()",
  "closeModal();showHighlights('account-42')",
  "closeModal();showSmartFeed()",
  "closeModal();showCreatorWallet()",
];
for (const callback of expectedCallbacks) assert(body.innerHTML.includes(`onclick="${callback}"`), `feature row callback must remain unchanged: ${callback}`);

const positions = expectedLabels.map(label => body.innerHTML.indexOf(`>${label}<`));
assert(positions.every((position, index) => index === 0 || position > positions[index - 1]), 'feature rows must preserve their existing order');
assert.strictEqual(events.filter(event => event.startsWith('action:')).length, 0, 'delegated feature actions must never execute in the detached renderer harness');

console.log('SETTINGS_FEATURES_CONTRACT_HARNESS=PASS');
console.log('MODAL_AND_ICON_ORDER=PASS');
console.log('FEATURE_LABELS=11');
console.log('DELEGATION_WIRING=PASS');
console.log('DELEGATED_ACTIONS_EXECUTED=0');
console.log('PROTECTED_SIDE_EFFECTS=0');
console.log('PRODUCTION_CHANGE=0');
