'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = '/home/ubuntu/novasocial';
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const moduleTexts = fs.readdirSync(path.join(repo, 'src'), { recursive: true })
  .filter(name => name.endsWith('.js'))
  .map(name => fs.readFileSync(path.join(repo, 'src', name), 'utf8'));
const allSource = [html, ...moduleTexts].join('\n');

const handlers = [...new Set([...html.matchAll(/onclick=["']\s*([A-Za-z_$][\w$]*)\s*\(/g)].map(match => match[1]))].sort();
const unresolved = handlers.filter(name => {
  const declaration = new RegExp(`\\b(?:async\\s+)?function\\s+${name}\\s*\\(`);
  const assignment = new RegExp(`\\b(?:window\\.)?${name}\\s*=`);
  return !declaration.test(allSource) && !assignment.test(allSource);
});

assert.strictEqual(handlers.length, 153, 'onclick handler inventory must reflect the current Notes reactor-list split');
assert.deepStrictEqual(unresolved, ['forwardMessage'], 'only the documented pre-existing forwardMessage seam may remain unresolved');
assert(html.includes('onclick="forwardMessage('), 'forwardMessage caller must remain visible for future product decision');
assert(html.includes('async function renderDMs()'), 'DM renderer must remain inline');
assert(html.includes('function showMsgMenu('), 'message action menu must remain inline');

console.log('INLINE_HANDLER_SURFACE_HARNESS=PASS');
console.log(`ONCLICK_HANDLERS=${handlers.length}`);
console.log(`UNRESOLVED_DOCUMENTED_SEAMS=${unresolved.length}`);
