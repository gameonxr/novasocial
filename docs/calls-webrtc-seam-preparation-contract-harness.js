const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const repo = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const sourceFiles = execFileSync('find', [path.join(repo, 'src'), '-type', 'f', '-name', '*.js'], { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
const sourceText = sourceFiles.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
const requiredMarkers = [
  '_callState',
  '_groupCallState',
  "db.from('call_signals')",
  'RTCPeerConnection',
  'navigator.mediaDevices',
  'window._pendingIceCandidates',
  '_flushPendingIceCandidates',
  'window._callReconnectTimeout = setTimeout(() => {',
  '}, 8000);',
  'async function endCall(updateDB)',
  'removeChannel'
];
for (const marker of requiredMarkers) {
  assert(html.includes(marker), `Calls/WebRTC dependency marker must remain inline: ${marker}`);
}
assert(html.includes('function createPeerConnection(callId, remoteUserId) {'), 'createPeerConnection must remain inline');
assert(html.includes('async function endCall(updateDB)'), 'endCall must remain inline');
assert.strictEqual(sourceText.includes('function createPeerConnection(callId, remoteUserId) {'), false, 'createPeerConnection must not be extracted');
assert.strictEqual(sourceText.includes('async function endCall(updateDB)'), false, 'endCall must not be extracted');
assert(fs.existsSync(path.join(repo, 'docs', 'calls-webrtc-contract.md')), 'Calls/WebRTC behavior contract must remain present');
assert(fs.existsSync(path.join(repo, 'docs', 'calls-webrtc-contract-harness.js')), 'Calls/WebRTC behavior harness must remain present');

console.log('CALLS_WEBRTC_SEAM_PREPARATION_HARNESS=PASS');
console.log('DEPENDENCY_MAP=STATE_SIGNALING_PEER_MEDIA_ICE_DOM_TIMERS_CLEANUP');
console.log('PROTECTED_CALL_SIGNATURES=2');
console.log('EXTRACTED_CALL_SIGNATURES=0');
console.log('RECONNECT_TIMEOUT_MS=8000');
console.log('PRODUCTION_SPLIT=0');
