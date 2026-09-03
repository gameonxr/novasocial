const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = process.env.NOVASOCIAL_REPO || path.resolve(__dirname, "..");
const contractPath = path.join(repo, 'docs', 'stories-lifecycle-editor-viewer-protected-readiness-contract.md');
const source = fs.readFileSync(path.join(repo, 'index.html'), 'utf8') + fs.readFileSync(path.join(repo, 'src', 'features', 'story-editor-owners.js'), 'utf8');
const contract = fs.readFileSync(contractPath, 'utf8');
const requiredMarkers = [
  'window.renderStoryElements',
  'voteStoryPoll('
];
const requiredSections = [
  '## Dependency map',
  '## Exact before/after parity boundary',
  '## Detached/browser-safe proof plan',
  '## Rollback artifact',
  '## Explicit feature authorization',
  '`PRODUCTION_DECISION=BLOCKED`',
  '`PRODUCTION_CHANGE=0`',
  '`LIVE_SIDE_EFFECTS=0`',
  '`BROWSER_LIVE_ACTIONS=0`'
];
for (const marker of requiredMarkers) assert(source.includes(marker), `protected source marker missing: ${marker}`);
for (const section of requiredSections) assert(contract.includes(section), `readiness requirement missing: ${section}`);
assert(contract.includes('PREPARATION_ONLY'), 'dossier must remain preparation-only');
assert(contract.includes('BLOCKED'), 'dossier must remain blocked');
assert(contract.includes('synthetic'), 'detached synthetic proof requirement must be explicit');
assert(contract.includes('real account'), 'real-account prohibition must be explicit');
assert(contract.includes('rollback'), 'rollback requirement must be explicit');
console.log('STORIES_LIFECYCLE_EDITOR_VIEWER_PROTECTED_READINESS_HARNESS=PASS');
console.log('DEPENDENCY_MAP=DOCUMENTED');
console.log('EXACT_BEFORE_AFTER_PARITY=REQUIRED');
console.log('DETACHED_BROWSER_SAFE_PROOF=REQUIRED');
console.log('ROLLBACK_ARTIFACT=REQUIRED');
console.log('EXPLICIT_FEATURE_AUTHORIZATION=REQUIRED');
console.log('PRODUCTION_DECISION=BLOCKED');
console.log('PRODUCTION_CHANGE=0');
