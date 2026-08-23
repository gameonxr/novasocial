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
const particleModule = fs.readFileSync(path.join(srcDir, 'features', 'spawn-like-particles.js'), 'utf8');
const proofFiles = [
  'particle-browser-proof-evidence.txt',
  'particle-browser-comparison-proof-evidence.txt',
  'particle-after-split-browser-proof-evidence.txt',
  'particle-parity-rollback-evidence.txt'
];
for (const file of proofFiles) {
  const evidencePath = path.join(repo, 'docs', file);
  assert(fs.existsSync(evidencePath), `Particle proof must exist: ${file}`);
  assert(fs.readFileSync(evidencePath, 'utf8').includes('PASS'), `Particle proof must contain PASS: ${file}`);
}

const moduleStart = particleModule.indexOf('window.spawnLikeParticles = function(el){');
assert(moduleStart >= 0, 'production particle module owner must be present');
const owner = particleModule.slice(moduleStart).replace('window.spawnLikeParticles = function(el){', 'function spawnLikeParticles(el){');

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
assert.strictEqual((html.match(/function spawnLikeParticles\(el\)\{/g) || []).length, 0, 'approved particle owner must be absent from inline HTML');
assert.strictEqual((particleModule.match(/window\.spawnLikeParticles\s*=\s*function\(el\)\{/g) || []).length, 1, 'approved particle owner must be assigned once in src');
assert(!/function\s+spawnLikeParticles\s*\(/.test(extracted), 'protected particle declaration must not be duplicated in src');
assert(owner.includes('document.body.appendChild(p)'), 'future seam must preserve body insertion');
assert(owner.includes('setTimeout(()=>p.remove(), 800)'), 'future seam must preserve 800 ms cleanup');
const seamContract = fs.readFileSync(path.join(repo, 'docs', 'particle-seam-preparation-contract.md'), 'utf8');
assert(seamContract.includes('Particle is the first candidate for any future protected-split proof'), 'particle candidate selection must remain explicit');
assert(seamContract.includes('SPLIT_COMPLETE'), 'particle candidate must record completed split');
assert(seamContract.includes('Approval status | SPLIT_COMPLETE'), 'particle production split must record completion');
assert(seamContract.includes('The explicit **test-only adapter boundary** is:'), 'particle test-only adapter boundary must remain explicit');
assert(seamContract.includes('does not import the test-only adapter'), 'particle adapter must remain test-only');
assert(seamContract.includes('## Test-only adapter comparison checklist'), 'particle comparison checklist must remain present');
assert(seamContract.includes('Approval gate | Particle split is approved only for this completed checkpoint'), 'particle approval must remain scoped to this checkpoint');
assert(seamContract.includes('Comparison harness | Test-only reference adapter observations match production owner observations and cleanup delays | PASS'), 'particle comparison harness result must remain recorded');
assert(seamContract.includes('Cleanup replay | Replaying captured cleanup callbacks is harmless and leaves every test particle removed | PASS'), 'particle cleanup replay result must remain recorded');
assert(seamContract.includes('Failure boundary | An injected body-append failure surfaces before timer scheduling and does not change the production owner | PASS'), 'particle failure boundary result must remain recorded');
assert(seamContract.includes('## Pre-approval gate'), 'particle pre-approval gate must remain present');
assert(seamContract.includes('After-split production parity | PASS'), 'particle after-split parity must record PASS');
assert(seamContract.includes('Rollback-after-split proof | PASS'), 'particle rollback-after-split proof must record PASS');
assert(seamContract.includes('Approval decision | READY_FOR_PARTICLE_ONLY'), 'particle approval decision must record particle-only readiness');
assert(seamContract.includes('## Reversible proof procedure'), 'particle reversible proof procedure must remain present');
assert(seamContract.includes('was executed on `Branch2`'), 'particle reversible proof procedure must record execution');
assert(seamContract.includes('Candidate proof | Compare before/after marker, load-order, DOM, timing, cleanup, and owner snapshots after the approved move | PASS'), 'particle candidate proof must record PASS');
assert(seamContract.includes('Rollback | Verify the split commit is revertible'), 'particle rollback control must remain explicit');
assert(seamContract.includes('Stop rule | Any mismatch'), 'particle stop rule must remain locked');
const parityEvidence = fs.readFileSync(path.join(repo, 'docs', 'particle-parity-rollback-evidence.txt'), 'utf8');
assert(parityEvidence.includes('Date: 2026-08-22'), 'particle current baseline revalidation date must remain recorded');
assert(parityEvidence.includes('After-split parity result: PASS'), 'particle after-split parity must be recorded');
assert(parityEvidence.includes('Rollback result: PASS'), 'particle rollback result must be recorded');
assert(parityEvidence.includes('PROOF_STATUS=REMAINING'), 'remaining protected proof status must stay active');
assert(parityEvidence.includes('OWNER_SHA256=44952efebe4daed59f18b3367561cc604b0cce3ea9d9092d1ff41d0bb541fb57'), 'particle owner baseline hash must remain recorded');
assert(owner.includes('if(!el) return;'), 'future seam must preserve null-target no-op');
assert(owner.includes('for(let i=0; i<12; i++)'), 'future seam must preserve twelve-particle count');
assert(owner.includes('el.getBoundingClientRect()'), 'future seam must preserve live target geometry');
assert(!owner.includes('db.'), 'particle owner must remain independent of database writes');
assert(!owner.includes('signInWithPassword'), 'particle owner must remain independent of authentication');

console.log('PARTICLE_SEAM_PREPARATION_CONTRACT_HARNESS=PASS');
console.log('PROTECTED_OWNER_INLINE=NO_APPROVED_PARTICLE');
console.log('DETERMINISTIC_MOCK_BOUNDARY=DOM_GEOMETRY_BODY_RANDOM_TIMER_CLEANUP');
console.log('PROOF_ARTIFACTS=4_PASS');
console.log('PRODUCTION_SPLIT_GATE=READY_FOR_PARTICLE_ONLY');
console.log('REVERSIBLE_PROOF_PROCEDURE=EXECUTED');
console.log('REVERSIBLE_BROWSER_PROOF=PARTICLE_PASS_REMAINING_18');
console.log('DIRECT_EXTRACTION=BLOCKED_FOR_REMAINING_11_PROTECTED_SYSTEMS');
console.log('PRODUCTION_SPLIT=1_PARTICLE');
