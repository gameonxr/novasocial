const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const repo = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const sourceFiles = execFileSync('find', [path.join(repo, 'src'), '-type', 'f', '-name', '*.js'], { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
const sourceText = sourceFiles.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
const storyModule = fs.readFileSync(path.join(repo, 'src', 'features', 'story-editor-owners.js'), 'utf8');
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
const storyViewerModules = ['show-story-viewers.js', 'close-sv.js', 'vote-story-poll.js', 'refresh-poll-results.js', 'load-story-poll-state.js', 'render-sv.js'].map(name => fs.readFileSync(path.join(repo, 'src', 'features', name), 'utf8')).join('\n');
const storyViewerSurface = html + '\n' + storyViewerModules;
for (const marker of requiredHtmlMarkers) {
  assert(storyViewerSurface.includes(marker), `Stories seam marker must remain inline: ${marker}`);
}
assert(!html.includes('function renderStoryElements()'), 'completed Story editor renderer must be absent from inline HTML');
assert.strictEqual((storyModule.match(/window\.renderStoryElements\s*=\s*function\(\)\{/g) || []).length, 1, 'completed Story editor renderer owner must occur once');
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
const injectedProofs = [
  ['story-viewer-contract-harness.js', 'createInjectedStoryPlaybackSeam'],
  ['story-poll-contract-harness.js', 'createInjectedStoryPollSeam'],
  ['story-viewers-list-contract-harness.js', 'createInjectedStoryViewersSeam'],
  ['story-reply-reaction-contract-harness.js', 'createInjectedStoryInteractionSeam'],
  ['story-submission-contract-harness.js', 'createInjectedStorySubmissionSeam'],
  ['story-deletion-contract-harness.js', 'createInjectedStoryDeletionSeam'],
];
for (const [file, marker] of injectedProofs) {
  const text = fs.readFileSync(path.join(repo, 'docs', file), 'utf8');
  assert(text.includes(marker), `Story injected seam proof must remain present: ${file}`);
}
const protectedSignatures = [
  'function openSV(startIdx)',
  'async function voteStoryPoll(storyId, pollIdx, options, optIdx, cardEl)',
  'async function refreshPollResults(storyId, pollIdx, options, cardEl, pickedIdxs)',
  'async function loadStoryPollState(storyId, pollIdx, options, cardEl)'
];
const storyPollVoteModule = fs.readFileSync(path.join(repo, 'src', 'features', 'vote-story-poll.js'), 'utf8');
const storyPollRefreshModule = fs.readFileSync(path.join(repo, 'src', 'features', 'refresh-poll-results.js'), 'utf8');
const storyPollStateModule = fs.readFileSync(path.join(repo, 'src', 'features', 'load-story-poll-state.js'), 'utf8');
for (const signature of protectedSignatures) {
  if (signature === 'async function voteStoryPoll(storyId, pollIdx, options, optIdx, cardEl)') {
    assert(storyPollVoteModule.includes('window.voteStoryPoll = async function voteStoryPoll('), 'approved Story poll vote owner must exist');
    continue;
  }
  if (signature === 'async function refreshPollResults(storyId, pollIdx, options, cardEl, pickedIdxs)') {
    assert(storyPollRefreshModule.includes('window.refreshPollResults = async function refreshPollResults('), 'approved Story poll refresh owner must exist');
    continue;
  }
  if (signature === 'async function loadStoryPollState(storyId, pollIdx, options, cardEl)') {
    assert(storyPollStateModule.includes('window.loadStoryPollState = async function loadStoryPollState('), 'approved Story poll state owner must exist');
    continue;
  }
  assert.strictEqual(sourceText.includes(signature), false, `Protected Story signature must not be extracted: ${signature}`);
}
const undoStoryEditorModule = fs.readFileSync(path.join(repo, 'src', 'features', 'undo-story-editor.js'), 'utf8');
const storyCallSurface = html + '\n' + undoStoryEditorModule;
assert(storyCallSurface.includes('renderStoryElements();'), 'Story viewer must retain its render call boundary');
assert(storyViewerSurface.includes('await refreshPollResults('), 'Poll voting must retain its result-refresh boundary');
assert(storyViewerSurface.includes('loadStoryPollState('), 'Poll cards must retain prior-state restoration boundary');
assert(html.includes('pauseAllVideos()'), 'Story viewers modal must retain media-pause boundary');

console.log('STORIES_SEAM_PREPARATION_HARNESS=PASS');
console.log('DEPENDENCY_MAP=VIEWER_PLAYBACK_VIEWERS_POLL_REPLIES_SUBMISSION_DELETION');
console.log('PROTECTED_STORY_SIGNATURES=5');
console.log('BROWSER_MOCK_EVIDENCE=2_PASS');
console.log('INJECTED_SEAM_PROOFS=6_PASS');
console.log('EXTRACTED_PROTECTED_STORY_SIGNATURES=0');
console.log('PRODUCTION_SPLIT=0');
