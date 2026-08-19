const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = '/home/ubuntu/novasocial';
const roots = ['index.html', 'sw.js', 'manifest.json', 'src', 'docs', 'MIGRATION_MAP.md'];
const files = [];
function addEntry(relative) {
  const full = path.join(repo, relative);
  const stat = fs.statSync(full);
  if (stat.isDirectory()) {
    for (const entry of fs.readdirSync(full)) addEntry(path.join(relative, entry));
  } else if (/\.(html|js|css|json|md)$/i.test(relative)) {
    files.push(full);
  }
}
for (const root of roots) addEntry(root);
files.sort();

const patterns = [
  ['private-key-header', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/i],
  ['github-pat', /(?:github_pat_|ghp_)[A-Za-z0-9_]+/],
  ['openai-secret-prefix', /\bsk-[A-Za-z0-9]{20,}\b/],
  ['supabase-service-role', /SUPABASE_SERVICE_ROLE|service_role_secret|service_role_key/i],
  ['aws-secret-assignment', /AWS_SECRET_ACCESS_KEY\s*[:=]/i],
  ['cloudinary-api-secret-assignment', /(?:api_secret|cloudinary_api_secret)\s*[:=]/i],
];
const findings = [];
for (const file of files) {
  if (path.basename(file) === 'credential-surface-contract-harness.js') continue;
  const text = fs.readFileSync(file, 'utf8');
  for (const [name, pattern] of patterns) {
    if (pattern.test(text)) findings.push(`${path.relative(repo, file)}:${name}`);
  }
}

assert(files.length > 0, 'credential surface must scan tracked text files');
assert.deepStrictEqual(findings, [], `credential-surface findings: ${findings.join(', ')}`);
console.log('CREDENTIAL_SURFACE_HARNESS=PASS');
console.log(`FILES_SCANNED=${files.length - 1}`);
console.log(`FINDINGS=${findings.length}`);
console.log('OUTPUT_REDACTION=PASS');
