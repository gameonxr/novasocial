const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = process.env.NOVASOCIAL_REPO || path.resolve(__dirname, "..");
const roots = ['index.html', 'sw.js', 'manifest.json', 'src'];
const files = [];
function addEntry(relative) {
  const full = path.join(repo, relative);
  const stat = fs.statSync(full);
  if (stat.isDirectory()) {
    for (const entry of fs.readdirSync(full)) addEntry(path.join(relative, entry));
  } else if (/\.(html|js|css|json)$/i.test(relative)) files.push(full);
}
for (const root of roots) addEntry(root);
files.sort();
const findings = [];
let utilsHttpRefs = 0;
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  const commentStripped = text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  if (/\bjavascript\s*:/i.test(commentStripped)) findings.push(`${path.relative(repo, file)}:javascript-url`);
  if (/data:(?:text\/html|application\/)/i.test(commentStripped)) findings.push(`${path.relative(repo, file)}:executable-data-url`);
  const relative = path.relative(repo, file);
  if (relative === 'src/core/utils.js') {
    const normalizationRefs = (text.match(/startsWith\('http:\/\/'\)/g) || []).length + (text.match(/href\s*=\s*'http:\/\/'/g) || []).length;
    utilsHttpRefs += normalizationRefs;
  } else {
    const httpMatches = commentStripped.match(/http:\/\//gi) || [];
    if (httpMatches.length) findings.push(`${relative}:insecure-http-reference`);
  }
}
assert.strictEqual(utilsHttpRefs, 2, 'utils.js must retain exactly two documented user-link normalization references');
assert.deepStrictEqual(findings, [], `external-resource findings: ${findings.join(', ')}`);
console.log('EXTERNAL_RESOURCE_URL_INTEGRITY_HARNESS=PASS');
console.log(`FILES_SCANNED=${files.length}`);
console.log(`ALLOWED_UTILS_HTTP_REFS=${utilsHttpRefs}`);
console.log(`FINDINGS=${findings.length}`);
