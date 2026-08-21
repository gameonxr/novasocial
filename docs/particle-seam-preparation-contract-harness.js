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
assert(owner.includes('if(!el) return;'), 'future seam must preserve null-target no-op');
assert(owner.includes('for(let i=0; i<12; i++)'), 'future seam must preserve twelve-particle count');
assert(owner.includes('el.getBoundingClientRect()'), 'future seam must preserve live target geometry');
assert(!owner.includes('db.'), 'particle owner must remain independent of database writes');
assert(!owner.includes('signInWithPassword'), 'particle owner must remain independent of authentication');

console.log('PARTICLE_SEAM_PREPARATION_CONTRACT_HARNESS=PASS');
console.log('PROTECTED_OWNER_INLINE=YES');
console.log('DETERMINISTIC_MOCK_BOUNDARY=DOM_GEOMETRY_BODY_RANDOM_TIMER_CLEANUP');
console.log('REVERSIBLE_BROWSER_PROOF=REMAINING');
console.log('DIRECT_EXTRACTION=BLOCKED_UNTIL_SEAM_PROOF');
console.log('PRODUCTION_SPLIT=0');
