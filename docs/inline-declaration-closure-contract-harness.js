const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = process.env.NOVASOCIAL_REPO || path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const start = html.indexOf('<script>');
const end = html.indexOf('</script>', start);
assert(start >= 0 && end > start, 'inline application script boundaries must exist');
const inline = html.slice(start, end);
const declarations = [...inline.matchAll(/^(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/gm)].map(match => match[1]);
const protectedNames = [
  'renderDMs','openChat','renderReels','createPeerConnection','spawnLikeParticles',
  'toggleRecording','enablePushFromSettings','resetPushFromSettings','submitNote','deleteMyNote',
  'reactToNote','loadNoteReactorsList','renderStoryElements',
  'syncLocalDeletionFallback'
];
assert.strictEqual(declarations.length, 6, 'inline application script must retain 228 function declarations after the loadMsgs whitespace normalization');
const remainingInlineProtectedNames = protectedNames.filter(name => !['renderDMs', 'renderReels', 'spawnLikeParticles', 'syncLocalDeletionFallback', 'enablePushFromSettings', 'resetPushFromSettings', 'viewNote', 'removeMyNoteFromViewer', 'deleteMyNote', 'renderStoryElements', 'loadNoteReactorsList', 'reactToNote', 'silentPushResubscribeIfGranted', 'submitNote', 'voteStoryPoll', 'refreshPollResults', 'loadStoryPollState', 'openSV', 'submitNativeEmojiReaction'].includes(name));
assert.deepStrictEqual(remainingInlineProtectedNames.filter(name => !declarations.includes(name)), [], 'all remaining protected declarations must remain inline');
assert.strictEqual(new Set(protectedNames).size, 14, 'protected declaration set must contain 14 unique names');
const source = fs.readdirSync(path.join(repo, 'src'), { recursive: true }).filter(file => String(file).endsWith('.js'));
for (const name of protectedNames.filter(name => name !== 'submitNote')) {
  if (name === 'reactToNote') {
    const reactionModule = fs.readFileSync(path.join(repo, 'src', 'features', 'notes-reaction-owner.js'), 'utf8');
    assert(reactionModule.includes('window.reactToNote = function reactToNote('), 'reactToNote must be externalized as a classic global');
    continue;
  }
  for (const file of source) {
    const text = fs.readFileSync(path.join(repo, 'src', file), 'utf8');
    assert(!new RegExp(`(?:async\\s+)?function\\s+${name}\\s*\\(`).test(text), `${name} must not be extracted to src/${file}`);
  }
}
const hasForwardImplementation = /(?:async\s+)?function\s+forwardMessage\s*\(/.test(inline) || /(?:window\.)?forwardMessage\s*=/.test(inline);
assert.strictEqual(hasForwardImplementation, true, 'forwardMessage must remain an authorized inline implementation');
assert(fs.readFileSync(path.join(repo, 'src', 'features', 'complete-forward-message.js'), 'utf8').includes('window.completeForwardMessage = async function completeForwardMessage('), 'approved completeForwardMessage owner must exist in its module');
assert((html + '\n' + fs.readFileSync(path.join(repo, 'src', 'features', 'show-msg-menu.js'), 'utf8')).includes('onclick="forwardMessage('), 'forwardMessage caller must remain present');
console.log('INLINE_DECLARATION_CLOSURE_HARNESS=PASS');
console.log(`INLINE_DECLARATIONS=${declarations.length}`);
console.log(`PROTECTED_DECLARATIONS=${protectedNames.length}`);
console.log('FORWARD_MESSAGE_IMPLEMENTATION=AUTHORIZED_INLINE');
