const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = '/home/ubuntu/novasocial';
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const scriptTags = [...html.matchAll(/<script\b[^>]*>/gi)].map(match => match[0]);
const moduleTags = scriptTags.filter(tag => /\btype\s*=\s*["']module["']/i.test(tag));
const asyncTags = scriptTags.filter(tag => /\b(?:defer|async)(?:\s*=|\s|>)/i.test(tag));
const extractedFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(fullPath);
    else if (entry.name.endsWith('.js')) extractedFiles.push(fullPath);
  }
}
walk(path.join(repo, 'src'));
const moduleSyntax = [];
for (const file of extractedFiles.sort()) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  lines.forEach((line, index) => {
    if (/^\s*(?:import|export)(?:\s|\{|\*|$)/.test(line)) {
      moduleSyntax.push(`${file}:${index + 1}:${line.trim()}`);
    }
  });
}

assert.strictEqual(scriptTags.length, 213, 'index.html must retain 213 script tags');
assert.deepStrictEqual(moduleTags, [], 'classic script architecture must not contain type=module tags');
assert.deepStrictEqual(asyncTags, [], 'classic script order must not contain defer or async attributes');
assert.deepStrictEqual(moduleSyntax, [], 'extracted classic scripts must not contain top-level import/export syntax');
assert.strictEqual(extractedFiles.length, 211, 'src must retain 211 extracted JavaScript files');

console.log('CLASSIC_SCRIPT_COMPATIBILITY_HARNESS=PASS');
console.log(`SCRIPT_TAGS=${scriptTags.length}`);
console.log(`EXTRACTED_JS=${extractedFiles.length}`);
console.log(`MODULE_TAGS=${moduleTags.length}`);
console.log(`ASYNC_OR_DEFER_TAGS=${asyncTags.length}`);
console.log(`EXTRACTED_MODULE_SYNTAX_MARKERS=${moduleSyntax.length}`);
