const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const repo = '/home/ubuntu/novasocial';
const branch2Html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const mainHtml = execFileSync('git', ['-C', repo, 'show', 'origin/main:index.html'], { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });

function hasImplementation(html) {
  return /\b(?:async\s+)?function\s+forwardMessage\s*\(/.test(html) || /\b(?:window\.)?forwardMessage\s*=/.test(html);
}

for (const [name, html] of [['Branch2', branch2Html], ['origin/main', mainHtml]]) {
  assert(html.includes('onclick="forwardMessage('), `${name} must retain the documented forwardMessage caller`);
  assert(!hasImplementation(html), `${name} must not invent a forwardMessage implementation`);
  assert(html.includes('async function renderDMs()'), `${name} must retain inline renderDMs`);
  assert(html.includes('function showMsgMenu('), `${name} must retain inline showMsgMenu`);
}

assert.strictEqual(branch2Html.match(/onclick="forwardMessage\(/g).length, mainHtml.match(/onclick="forwardMessage\(/g).length, 'Branch2 and main must retain the same forwardMessage caller count');

console.log('FORWARD_MESSAGE_SEAM_PARITY_HARNESS=PASS');
console.log(`BRANCH2_CALLERS=${branch2Html.match(/onclick="forwardMessage\(/g).length}`);
console.log(`MAIN_CALLERS=${mainHtml.match(/onclick="forwardMessage\(/g).length}`);
console.log('IMPLEMENTATIONS=0');
