'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = process.env.NOVASOCIAL_REPO || path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const moduleTexts = fs.readdirSync(path.join(repo, 'src'), { recursive: true })
  .filter(name => name.endsWith('.js'))
  .map(name => fs.readFileSync(path.join(repo, 'src', name), 'utf8'));
const allSource = [html, ...moduleTexts].join('\n');
const dmsModule = fs.readFileSync(path.join(repo, 'src', 'features', 'dms-renderer-owner.js'), 'utf8');

const handlers = [...new Set([...html.matchAll(/onclick=["']\s*([A-Za-z_$][\w$]*)\s*\(/g)].map(match => match[1]))].sort();
const unresolved = handlers.filter(name => {
  const declaration = new RegExp(`\\b(?:async\\s+)?function\\s+${name}\\s*\\(`);
  const assignment = new RegExp(`\\b(?:window\\.)?${name}\\s*=`);
  return !declaration.test(allSource) && !assignment.test(allSource);
});

assert.strictEqual(handlers.length, 136, 'onclick handler inventory must reflect the current Reels renderer split');
assert.deepStrictEqual(unresolved, [], 'all current inline handler targets must resolve after the authorized forwardMessage implementation');
assert(html.includes('onclick="forwardMessage('), 'forwardMessage caller must remain visible');
assert(/(?:async\s+)?function\s+forwardMessage\s*\(/.test(html), 'Branch2 must expose the authorized inline forwardMessage implementation');
assert(/(?:async\s+)?function\s+completeForwardMessage\s*\(/.test(html), 'Branch2 must expose the bounded completion helper');
assert(!html.includes('async function renderDMs()'), 'approved DMs renderer must not remain inline');
assert(dmsModule.includes('window.renderDMs = async function(){'), 'approved DMs renderer module owner must resolve');
assert(html.includes('function showMsgMenu('), 'message action menu must remain inline');

console.log('INLINE_HANDLER_SURFACE_HARNESS=PASS');
console.log(`ONCLICK_HANDLERS=${handlers.length}`);
console.log(`UNRESOLVED_DOCUMENTED_SEAMS=${unresolved.length}`);
console.log('FORWARD_MESSAGE_IMPLEMENTATION=AUTHORIZED_INLINE');
