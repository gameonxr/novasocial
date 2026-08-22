const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const repo = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const sourceFiles = execFileSync('find', [path.join(repo, 'src'), '-type', 'f', '-name', '*.js'], { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
const sourceText = sourceFiles.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
const browserProofFiles = [
  'stories-empty-data-browser-proof-evidence.txt',
  'stories-image-setup-browser-proof-evidence.txt'
];
for (const file of browserProofFiles) {
  const evidencePath = path.join(repo, 'docs', file);
  assert(fs.existsSync(evidencePath), `Stories browser proof must exist: ${file}`);
  assert(fs.readFileSync(evidencePath, 'utf8').includes('PASS'), `Stories browser proof must contain PASS: ${file}`);
}
const requiredHtmlMarkers = [
  'function openSV(startIdx)',
  'function renderStoryElements()',
  'async function voteStoryPoll(storyId, pollIdx, options, optIdx, cardEl)',
  'async function refreshPollResults(storyId, pollIdx, options, cardEl, pickedIdxs)',
  'async function loadStoryPollState(storyId, pollIdx, options, cardEl)',
  'function renderSV()',
  'function closeSV()',
  'function showStoryViewers(storyId)',
  'svBucketIdx',
  'svStoryIdx',
  'svTimer',
  'canplay',
  'timeupdate',
  'story_views',
  'multiVote',
  'story_poll_votes'
];
for (const marker of requiredHtmlMarkers) {
  assert(html.includes(marker), `Stories seam marker must remain inline: ${marker}`);
}
const requiredContracts = [
  'story-viewer-contract.md',
  'story-viewer-contract-harness.js',
  'story-poll-contract.md',
  'story-poll-contract-harness.js',
  'story-viewers-list-contract.md',
  'story-viewers-list-contract-harness.js',
  'story-reply-reaction-contract.md',
  'story-reply-reaction-contract-harness.js',
  'story-submission-contract.md',
  'story-submission-contract-harness.js',
  'story-deletion-contract.md',
  'story-deletion-contract-harness.js'
];
for (const file of requiredContracts) {
  assert(fs.existsSync(path.join(repo, 'docs', file)), `Existing Story contract/harness must remain present: ${file}`);
}
const protectedSignatures = [
  'function openSV(startIdx)',
  'function renderStoryElements()',
  'async function voteStoryPoll(storyId, pollIdx, options, optIdx, cardEl)',
  'async function refreshPollResults(storyId, pollIdx, options, cardEl, pickedIdxs)',
  'async function loadStoryPollState(storyId, pollIdx, options, cardEl)'
];
for (const signature of protectedSignatures) {
  assert.strictEqual(sourceText.includes(signature), false, `Protected Story signature must not be extracted: ${signature}`);
}
assert(html.includes('renderStoryElements();'), 'Story viewer must retain its render call boundary');
assert(html.includes('await refreshPollResults('), 'Poll voting must retain its result-refresh boundary');
assert(html.includes('loadStoryPollState('), 'Poll cards must retain prior-state restoration boundary');
assert(html.includes('pauseAllVideos()'), 'Story viewers modal must retain media-pause boundary');

console.log('STORIES_SEAM_PREPARATION_HARNESS=PASS');
console.log('DEPENDENCY_MAP=VIEWER_PLAYBACK_VIEWERS_POLL_REPLIES_SUBMISSION_DELETION');
console.log('PROTECTED_STORY_SIGNATURES=5');
console.log('BROWSER_MOCK_EVIDENCE=2_PASS');
console.log('EXTRACTED_PROTECTED_STORY_SIGNATURES=0');
console.log('PRODUCTION_SPLIT=0');
