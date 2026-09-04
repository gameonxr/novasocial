const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const repo = process.env.NOVASOCIAL_REPO || path.resolve(__dirname, "..");
const branch2Html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const mainHtml = execFileSync('git', ['-C', repo, 'show', 'origin/main:index.html'], { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });

function hasImplementation(html) {
  return /\b(?:async\s+)?function\s+forwardMessage\s*\(/.test(html) || /\b(?:window\.)?forwardMessage\s*=/.test(html);
}

const showMsgMenuModuleText = fs.readFileSync(path.join(repo, 'src', 'features', 'show-msg-menu.js'), 'utf8');
for (const [name, html] of [['Branch2', branch2Html + '\n' + showMsgMenuModuleText], ['origin/main', mainHtml]]) {
  assert(html.includes('onclick="forwardMessage('), `${name} must retain the documented forwardMessage caller`);
  if (name === 'Branch2') assert(!html.includes('async function renderDMs()'), 'Branch2 must use the approved external DMs renderer owner');
  else assert(html.includes('async function renderDMs()'), 'origin/main must retain inline renderDMs baseline');
  assert(html.includes('function showMsgMenu('), `${name} must retain inline showMsgMenu`);
}
assert(hasImplementation(branch2Html), 'Branch2 must contain the authorized inline forwardMessage implementation');
assert((branch2Html + '\n' + fs.readFileSync(path.join(repo, 'src', 'features', 'complete-forward-message.js'), 'utf8')).includes('async function completeForwardMessage('), 'Branch2 must contain the bounded completion helper');
assert(!hasImplementation(mainHtml), 'origin/main must remain caller-only for forwardMessage');

assert.strictEqual((branch2Html + '\n' + showMsgMenuModuleText).match(/onclick="forwardMessage\(/g).length, mainHtml.match(/onclick="forwardMessage\(/g).length, 'Branch2 and main must retain the same forwardMessage caller count');

console.log('FORWARD_MESSAGE_SEAM_PARITY_HARNESS=PASS');
console.log(`BRANCH2_CALLERS=${(branch2Html + '\n' + showMsgMenuModuleText).match(/onclick="forwardMessage\(/g).length}`);
console.log(`MAIN_CALLERS=${mainHtml.match(/onclick="forwardMessage\(/g).length}`);
console.log('BRANCH2_IMPLEMENTATION=AUTHORIZED_INLINE');
console.log('MAIN_IMPLEMENTATION=0');
