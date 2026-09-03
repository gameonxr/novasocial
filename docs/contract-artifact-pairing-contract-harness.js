'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = process.env.NOVASOCIAL_REPO || path.resolve(__dirname, "..");
const docsDir = path.join(repo, 'docs');
const names = fs.readdirSync(docsDir);
const contracts = names.filter(name => name.endsWith('-contract.md')).sort();
const legacyPairs = new Map([
  ['account-bootstrap-contract.md', 'account-bootstrap-adapter-harness.js'],
  ['logout-account-transition-contract.md', 'logout-account-transition-harness.js'],
  ['blocking-contract-assessment.md', 'blocking-contract-harness.js']
]);
const legacyHarnesses = new Set(legacyPairs.values());
const standardHarnesses = names.filter(name => name.endsWith('-contract-harness.js') && !legacyHarnesses.has(name)).sort();

assert(contracts.length > 0, 'at least one contract document is required');

for (const contract of contracts) {
  const expectedHarness = legacyPairs.get(contract) || contract.replace(/\.md$/, '-harness.js');
  assert(names.includes(expectedHarness), `missing harness for ${contract}: ${expectedHarness}`);
}

for (const harness of standardHarnesses) {
  const expectedContract = harness.replace(/-harness\.js$/, '.md');
  assert(names.includes(expectedContract), `missing contract for ${harness}: ${expectedContract}`);
}

for (const [contract, harness] of legacyPairs) {
  assert(names.includes(contract), `legacy contract missing: ${contract}`);
  assert(names.includes(harness), `legacy harness missing: ${harness}`);
}

assert(names.includes('protected-contract-coverage.md'), 'protected coverage inventory must be present');
assert(names.includes('protected-contract-coverage-harness.js'), 'protected coverage harness must be present');
assert(names.includes('protected-inline-boundary-contract.md'), 'protected inline inventory must be present');
assert(names.includes('protected-inline-boundary-contract-harness.js'), 'protected inline harness must be present');

const migrationMap = fs.readFileSync(path.join(repo, 'MIGRATION_MAP.md'), 'utf8');
assert(migrationMap.includes('Protected-contract coverage checkpoint'), 'migration map must record protected coverage checkpoint');
assert(migrationMap.includes('Protected-inline boundary inventory checkpoint'), 'migration map must record inline-boundary checkpoint');

console.log('CONTRACT_ARTIFACT_PAIRING_HARNESS=PASS');
console.log(`STANDARD_CONTRACTS=${contracts.length}`);
console.log(`STANDARD_HARNESSES=${standardHarnesses.length}`);
console.log('LEGACY_PAIR_EXCEPTIONS=3');
