const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const srcDir = path.join(repo, 'src');
const sourceFiles = [];
function collect(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collect(full);
    else if (entry.name.endsWith('.js')) sourceFiles.push(full);
  }
}
collect(srcDir);
const extracted = sourceFiles.map(file => fs.readFileSync(file, 'utf8')).join('\n');
const proofFiles = [
  'particle-browser-proof-evidence.txt',
  'particle-parity-rollback-evidence.txt'
];
for (const file of proofFiles) {
  const evidencePath = path.join(repo, 'docs', file);
  assert(fs.existsSync(evidencePath), `Particle proof must exist: ${file}`);
  assert(fs.readFileSync(evidencePath, 'utf8').includes('PASS'), `Particle proof must contain PASS: ${file}`);
}

const ownerStart = html.indexOf('function spawnLikeParticles(el){');
const ownerEnd = html.indexOf('\n// Override toggleLike', ownerStart);
assert(ownerStart >= 0 && ownerEnd > ownerStart, 'inline particle owner boundary must remain present and ordered');
const owner = html.slice(ownerStart, ownerEnd);

for (const marker of [
  'function spawnLikeParticles(el){',
  'if(!el) return;',
  'el.getBoundingClientRect()',
  'for(let i=0; i<12; i++)',
  "p.className = 'particle';",
  'document.body.appendChild(p);',
  'setTimeout(()=>p.remove(), 800);',
  'Math.random()',
  "'--tx'",
  "'--ty'"
]) {
  assert(owner.includes(marker) || html.includes(marker), `particle seam marker missing: ${marker}`);
}
assert(fs.existsSync(path.join(repo, 'docs', 'spawn-like-particles-contract.md')), 'particle behavior contract must remain present');
assert(fs.existsSync(path.join(repo, 'docs', 'spawn-like-particles-contract-harness.js')), 'particle behavior harness must remain present');
assert.strictEqual((html.match(/function spawnLikeParticles\(el\)\{/g) || []).length, 1, 'protected particle owner must remain exactly once inline');
assert(!/function\s+spawnLikeParticles\s*\(/.test(extracted), 'protected particle owner must not be extracted into src');
assert(owner.includes('document.body.appendChild(p)'), 'future seam must preserve body insertion');
assert(owner.includes('setTimeout(()=>p.remove(), 800)'), 'future seam must preserve 800 ms cleanup');
const seamContract = fs.readFileSync(path.join(repo, 'docs', 'particle-seam-preparation-contract.md'), 'utf8');
assert(seamContract.includes('Particle is the first candidate for any future protected-split proof'), 'particle candidate selection must remain explicit');
assert(seamContract.includes('it must not move `spawnLikeParticles()`'), 'particle candidate must remain test-only');
assert(seamContract.includes('Approval status | Not approved'), 'particle production split must remain unapproved');
assert(seamContract.includes('The explicit **test-only adapter boundary** is:'), 'particle test-only adapter boundary must remain explicit');
assert(seamContract.includes('must not be imported by `index.html`'), 'particle adapter must not enter production HTML');
assert(seamContract.includes('## Test-only adapter comparison checklist'), 'particle comparison checklist must remain present');
assert(seamContract.includes('Approval gate | Comparison remains unapproved'), 'particle comparison approval gate must remain locked');
assert(seamContract.includes('Comparison harness | Test-only reference adapter observations match inline owner observations and cleanup delays | PASS'), 'particle comparison harness result must remain recorded');
assert(seamContract.includes('Cleanup replay | Replaying captured cleanup callbacks is harmless and leaves every test particle removed | PASS'), 'particle cleanup replay result must remain recorded');
assert(seamContract.includes('Failure boundary | An injected body-append failure surfaces before timer scheduling and does not change the inline owner | PASS'), 'particle failure boundary result must remain recorded');
assert(seamContract.includes('## Pre-approval gate'), 'particle pre-approval gate must remain present');
assert(seamContract.includes('After-split production parity | NOT RUN'), 'particle after-split parity must remain unrun');
assert(seamContract.includes('Rollback-after-split proof | NOT RUN'), 'particle rollback-after-split proof must remain unrun');
assert(seamContract.includes('Approval decision | NOT READY'), 'particle approval decision must remain not ready');
assert(seamContract.includes('## Reversible proof procedure'), 'particle reversible proof procedure must remain present');
assert(seamContract.includes('not executed by this checkpoint'), 'particle reversible proof procedure must remain unexecuted');
assert(seamContract.includes('Candidate proof | If and only if approved later'), 'particle candidate proof must remain gated');
assert(seamContract.includes('Rollback | Restore the prior Branch2 commit'), 'particle rollback control must remain explicit');
assert(seamContract.includes('Stop rule | Any mismatch'), 'particle stop rule must remain locked');
const parityEvidence = fs.readFileSync(path.join(repo, 'docs', 'particle-parity-rollback-evidence.txt'), 'utf8');
assert(parityEvidence.includes('Latest baseline revalidation — 2026-08-22'), 'particle current baseline revalidation must remain recorded');
assert(parityEvidence.includes('It is not before/after production-split proof'), 'particle baseline revalidation must not be treated as split proof');
assert(owner.includes('if(!el) return;'), 'future seam must preserve null-target no-op');
assert(owner.includes('for(let i=0; i<12; i++)'), 'future seam must preserve twelve-particle count');
assert(owner.includes('el.getBoundingClientRect()'), 'future seam must preserve live target geometry');
assert(!owner.includes('db.'), 'particle owner must remain independent of database writes');
assert(!owner.includes('signInWithPassword'), 'particle owner must remain independent of authentication');

console.log('PARTICLE_SEAM_PREPARATION_CONTRACT_HARNESS=PASS');
console.log('PROTECTED_OWNER_INLINE=YES');
console.log('DETERMINISTIC_MOCK_BOUNDARY=DOM_GEOMETRY_BODY_RANDOM_TIMER_CLEANUP');
console.log('PROOF_ARTIFACTS=2_PASS');
console.log('PRODUCTION_SPLIT_GATE=NOT_READY');
console.log('REVERSIBLE_PROOF_PROCEDURE=PREPARED_NOT_EXECUTED');
console.log('REVERSIBLE_BROWSER_PROOF=REMAINING');
console.log('DIRECT_EXTRACTION=BLOCKED_UNTIL_SEAM_PROOF');
console.log('PRODUCTION_SPLIT=0');
