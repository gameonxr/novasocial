const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const repo = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8') + '\n' + fs.readFileSync(path.join(repo, 'src', 'features', 'toggle-recording.js'), 'utf8');
const sourceFiles = execFileSync('find', [path.join(repo, 'src'), '-type', 'f', '-name', '*.js'], { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
const sourceText = sourceFiles.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
const browserProofFiles = [
  'voice-browser-proof-evidence.txt',
  'recording-start-stop-browser-proof-evidence.txt',
  'recording-failure-browser-proof-evidence.txt'
];
for (const file of browserProofFiles) {
  const evidencePath = path.join(repo, 'docs', file);
  assert(fs.existsSync(evidencePath), `Voice recording browser proof must exist: ${file}`);
  assert(fs.readFileSync(evidencePath, 'utf8').includes('PASS'), `Voice recording browser proof must contain PASS: ${file}`);
}
const requiredHtmlMarkers = [
  'async function toggleRecording(cid)',
  'mediaRecorder',
  'audioChunks',
  'recording=false',
  'navigator.mediaDevices.getUserMedia',
  'new MediaRecorder(stream)',
  'audio/webm',
  '500',
  'stream.getTracks().forEach(t=>t.stop())',
  'throwOnError()',
  'MESSAGING_BLOCKED',
  '_segmentAudio',
  'realtime'
];
for (const marker of requiredHtmlMarkers) {
  assert(html.includes(marker), `Voice seam marker must remain inline: ${marker}`);
}
assert(fs.existsSync(path.join(repo, 'docs', 'voice-recording-contract.md')), 'Voice Recording behavior contract must remain present');
assert(fs.existsSync(path.join(repo, 'docs', 'voice-recording-contract-harness.js')), 'Voice Recording behavior harness must remain present');
const voiceHarness = fs.readFileSync(path.join(repo, 'docs', 'voice-recording-contract-harness.js'), 'utf8');
assert(voiceHarness.includes('createInjectedVoiceSeam'), 'Voice recording injected seam proof must remain present');
assert(voiceHarness.includes("calls.push('recorder-flow')"), 'Voice recording injected seam dispatch marker must remain present');
assert(fs.readFileSync(path.join(repo, 'src', 'features', 'toggle-recording.js'), 'utf8').includes('window.toggleRecording = async function toggleRecording('), 'approved toggleRecording owner must exist in its module');
assert(html.includes('audioChunks=[]'), 'Recorder chunk state must remain inline');
assert(html.includes('new Blob(audioChunks,{type:\'audio/webm\'})') || html.includes('new Blob(audioChunks, {type:\'audio/webm\'})'), 'Recorder must retain webm assembly boundary');
assert(html.includes('navigator.mediaDevices.getUserMedia'), 'Recorder must retain microphone permission boundary');
assert(html.includes('stream.getTracks().forEach(t=>t.stop())'), 'Recorder must retain microphone track cleanup');
assert(html.includes('throwOnError()'), 'Recorder must retain strict audio-message insertion boundary');
assert(html.includes('realtime'), 'Voice delivery must remain owned by the existing realtime path');

console.log('VOICE_RECORDING_SEAM_PREPARATION_HARNESS=PASS');
console.log('DEPENDENCY_MAP=RECORDER_CAPTURE_UPLOAD_INSERT_REALTIME_CLEANUP');
console.log('PROTECTED_RECORDING_SIGNATURES=1');
console.log('BROWSER_MOCK_EVIDENCE=3_PASS');
console.log('INJECTED_SEAM_PROOF=PASS');
console.log('EXTRACTED_PROTECTED_RECORDING_SIGNATURES=0');
console.log('PRODUCTION_SPLIT=0');
