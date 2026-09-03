const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const repo = path.resolve(__dirname, '..');
const files = [path.join(repo, 'index.html'), ...execFileSync('find', [path.join(repo, 'src'), '-type', 'f', '-name', '*.js'], { encoding: 'utf8' }).trim().split('\n').filter(Boolean)];
const source = files.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
const messages = fs.readFileSync(path.join(repo, 'src', 'features', 'message-clipboard-helpers.js'), 'utf8');
const invite = fs.readFileSync(path.join(repo, 'src', 'features', 'copy-invite-link.js'), 'utf8');
const story = fs.readFileSync(path.join(repo, 'src', 'features', 'copy-story-link.js'), 'utf8');
const postActions = fs.readFileSync(path.join(repo, 'src', 'features', 'post-actions.js'), 'utf8');
const settings = fs.readFileSync(path.join(repo, 'src', 'features', 'settings.js'), 'utf8');
const profile = fs.readFileSync(path.join(repo, 'src', 'features', 'profile-view.js'), 'utf8');

assert.strictEqual(files.length, 349, 'index.html plus 240 extracted modules must be audited after the DMs renderer split');
assert.strictEqual((source.match(/navigator\.clipboard\.writeText\(/g) || []).length, 7, 'seven clipboard writeText calls must remain');
assert.strictEqual((source.match(/document\.execCommand\(['"]copy['"]\)/g) || []).length, 1, 'one legacy copy fallback must remain');
assert(messages.includes('async function copyMsg(id, text)'), 'message copy helper must remain');
assert(messages.includes('await navigator.clipboard.writeText(text)'), 'message copy awaited path must remain');
assert(messages.includes("catch(e) { toast('Could not copy'); }"), 'message copy error toast must remain');
assert(messages.includes('navigator.clipboard.writeText(text).then(() => toast'), 'message Promise-chain path must remain');
assert(invite.includes('function copyInviteLink(link)'), 'invite copy helper must remain');
assert(story.includes('navigator.clipboard.writeText(window.location.origin + \'/?story=\' + id)'), 'story-link copy surface must remain');
assert(postActions.includes("document.execCommand('copy')"), 'post-link legacy fallback must remain');
assert(settings.includes('navigator.clipboard.writeText(link)'), 'settings link copy surface must remain');
assert(profile.includes('navigator.clipboard.writeText(link)'), 'profile link copy surface must remain');

console.log('CLIPBOARD_INTERACTION_HARNESS=PASS');
console.log(`AUDITED_FILES=${files.length}`);
console.log('WRITE_TEXT_CALLS=7');
console.log('LEGACY_COPY_FALLBACKS=1');
console.log('MESSAGE_HELPER_BOUNDARIES=PASS');
console.log('COPY_SURFACES=PASS');
