const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = '/home/ubuntu/novasocial';
const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(fullPath);
    else if (entry.name.endsWith('.js') || entry.name.endsWith('.css')) files.push(fullPath);
  }
}
walk(path.join(repo, 'src'));
files.sort();
const violations = [];
let allowedUtilsStyleTags = 0;
for (const file of files.sort()) {
  const bytes = fs.readFileSync(file);
  let text;
  try {
    text = bytes.toString('utf8');
    if (Buffer.from(text, 'utf8').compare(bytes) !== 0) violations.push(`${file}:invalid-utf8-roundtrip`);
  } catch (error) {
    violations.push(`${file}:invalid-utf8`);
    continue;
  }
  if (bytes.includes(0)) violations.push(`${file}:nul-byte`);
  if (text.includes('\r\n')) violations.push(`${file}:crlf`);
  const commentStripped = text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  if (/<\/?script\b/i.test(commentStripped)) violations.push(`${file}:embedded-script-boundary`);
  if (/<\/?style\b/i.test(commentStripped)) violations.push(`${file}:embedded-style-boundary`);
}

assert.strictEqual(files.length, 235, 'src must contain 235 extracted JS/CSS files after the eight approved protected owner groups');
assert.strictEqual(allowedUtilsStyleTags, 0, 'no executable/template style container tags may remain after comments are removed');
assert.deepStrictEqual(violations, [], `source-boundary violations: ${violations.join(', ')}`);

console.log('SOURCE_BOUNDARY_HYGIENE_HARNESS=PASS');
console.log(`FILES_SCANNED=${files.length}`);
console.log(`COMMENT_STRIPPED_STYLE_TAGS=${allowedUtilsStyleTags}`);
console.log(`VIOLATIONS=${violations.length}`);
