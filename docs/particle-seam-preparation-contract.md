# NovaSocial Particle Seam Preparation Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Purpose:** Record the reversible seam and completed production split for the protected like-particle effect without broadening extraction to other protected systems.

## Current owner

The protected `spawnLikeParticles(el)` owner was originally inline in `index.html`; it now resides in `src/features/spawn-like-particles.js` as an anonymous function assigned to `window.spawnLikeParticles`. It remains protected because it runs at the visual edge of like interactions and depends on live DOM geometry, body insertion, CSS custom properties, timers, and cleanup callbacks.

## Proposed seam

A future adapter may accept a target element plus injected dependencies for geometry access, particle creation, body insertion, randomness, timer scheduling, and cleanup. The adapter must preserve the current owner’s null-target no-op and must not own like persistence, post state, authentication, navigation, or database writes.

The explicit **test-only adapter boundary** is: `target` plus injected `geometry`, `createElement`, `appendToBody`, `random`, `setTimeout`, and `remove` dependencies in; particle element mutations and scheduled cleanup observations out. The production split uses the preserved `window.spawnLikeParticles` global handoff and does not import the test-only adapter or create a second owner.

| Boundary | Required invariant | Proof input |
|---|---|---|
| Target guard | Missing target creates no particles and schedules no timers | `null` target mock |
| Geometry | Twelve particles begin at the target center | Fixed bounding rectangle |
| Palette/vectors | Existing palette and radial transform behavior remain stable | Deterministic random stream |
| DOM insertion | Every particle uses `.particle` and is appended to `document.body` | Mock body and element factory |
| Cleanup | Every particle schedules 800 ms removal and removes itself | Captured timer callbacks |
| Integration | Like persistence remains outside the seam | No database or like handler calls |
| Proof inventory | Browser particle mock, disposable browser comparison, parity/rollback, and current baseline revalidation remain present with PASS markers | Existing evidence |

## Candidate selection

Particle is the first candidate for any future protected-split proof because its owner is isolated from database writes, authentication, navigation, microphone/camera access, subscriptions, and realtime state. The next permitted checkpoint is test-only seam preparation plus before/after static snapshot design using the explicit adapter boundary below; it must not move `spawnLikeParticles()` or introduce a second production owner.

| Candidate control | Required status |
|---|---|
| Risk scope | Visual DOM/timer effect only; no persistence or account side effects |
| Preparation boundary | Injected geometry, element factory, body insertion, randomness, timer, and cleanup dependencies in test-only design |
| Production owner | `src/features/spawn-like-particles.js` assigns the sole `window.spawnLikeParticles` owner; `like-effects.js` remains a global caller |
| Approval status | SPLIT_COMPLETE; browser proof, before/after production parity, and rollback proof PASS |
| Stop condition | Any marker, timing, cleanup, or DOM difference stops the candidate |

## Test-only adapter comparison checklist

| Comparison | Required observation |
|---|---|
| Owner isolation | The inline definition is removed from `index.html`; one anonymous owner is assigned to `window.spawnLikeParticles` in `src/`, and the test-only adapter is not imported by production HTML |
| Dependency injection | Geometry, element creation, body insertion, randomness, timer scheduling, and cleanup are supplied by the test boundary only |
| Behavioral parity | Null-target guard, twelve-particle count, target-center geometry, palette/vector mutations, and 800 ms cleanup match the inline contract |
| Side-effect exclusion | No like persistence, database, authentication, navigation, realtime, or media API calls occur |
| Approval gate | Particle split is approved only for this completed checkpoint; remaining protected systems still require their own reversible browser proof and parity |
| Comparison harness | Test-only reference adapter observations match production owner observations and cleanup delays | PASS |
| Cleanup replay | Replaying captured cleanup callbacks is harmless and leaves every test particle removed | PASS |
| Failure boundary | An injected body-append failure surfaces before timer scheduling and does not change the production owner | PASS |


## Pre-approval gate

The particle candidate entered production-split execution only after every prerequisite below passed. The controlled production split and its after-split proofs are now complete; remaining protected systems are not approved by this record.

| Approval check | Current status | Required evidence |
|---|---|---|
| Current inline baseline | PASS | 213/213/212 script counts, one inline owner, required markers, zero protected source matches, and owner hash `44952efebe4daed59f18b3367561cc604b0cce3ea9d9092d1ff41d0bb541fb57` |
| Test-only adapter comparison | PASS | Deterministic observations and cleanup delays match the inline owner |
| Browser mock restoration | PASS | Temporary DOM/timer APIs restore and existing particle browser proof remains PASS |
| Disposable browser-context comparison | PASS | Inline owner and test-only adapter snapshots, cleanup delays, null-target guard, replay, and global restoration match |
| After-split production parity | PASS | Before/after marker, load-order, behavior, canonical owner hash, and source-ownership comparison |
| Rollback-after-split proof | PASS | Split commit is revertible; protected checks rerun cleanly after the split |
| Approval decision | READY_FOR_PARTICLE_ONLY | Keep `PROOF_STATUS=REMAINING` for other systems and `DIRECT_EXTRACTION=BLOCKED_FOR_REMAINING_PROTECTED_SYSTEMS` |

## Reversible proof procedure

The following procedure was executed on `Branch2` with no login, permission request, like action, database write, media access, or account mutation. Its particle results are recorded in the comparison, after-split browser, and rollback evidence files.

| Step | Required control | Current status |
|---|---|---|
| Baseline capture | Record the candidate commit, script counts, inline owner count, required particle markers, zero protected `src/` matches, and exact inline owner hash | Prepared; current baseline revalidated |
| Mock comparison | Run the deterministic browser mock and test-only injected adapter comparison with all temporary globals restored in `finally` | PASS |
| Candidate proof | Compare before/after marker, load-order, DOM, timing, cleanup, and owner snapshots after the approved move | PASS |
| Rollback | Verify the split commit is revertible and rerun the baseline and mock checks; never force-push or alter `main` | PASS |
| Stop rule | Any mismatch, unexpected side effect, or failed restoration aborts the candidate and keeps extraction blocked | LOCKED |

## Readiness gate

This particle checkpoint is split-complete. Three non-destructive proof artifacts cover the mock, disposable comparison, and parity/rollback baseline; the after-split production browser proof additionally confirms module loading, global caller order, twelve-particle creation, and cleanup. The complete regression gate and rollback checks must remain green. The global `DIRECT_EXTRACTION=BLOCKED_FOR_REMAINING_PROTECTED_SYSTEMS` policy remains active for every other protected owner.

## Harness coverage

`docs/particle-seam-preparation-contract-harness.js` statically verifies the approved window-assigned owner, exact protected boundaries, existing particle contract/harness, the three passing non-destructive proof artifacts, after-split browser evidence, deterministic mock requirements, the proposed adapter inputs, the test-only comparison checklist, and one approved extracted particle owner. The existing behavior harness executes the injected reference adapter comparison, harmless cleanup-callback replay, and injected append-failure branch with deterministic DOM/timer dependencies; it does not create production modules, trigger likes, or modify production code.

## References

1. [`index.html`](../index.html)
2. [`spawn-like-particles-contract.md`](./spawn-like-particles-contract.md)
3. [`spawn-like-particles-contract-harness.js`](./spawn-like-particles-contract-harness.js)
4. [`high-risk-extraction-gate-contract.md`](./high-risk-extraction-gate-contract.md)
5. [`high-risk-seam-readiness-matrix-contract.md`](./high-risk-seam-readiness-matrix-contract.md)
6. [`particle-browser-proof-evidence.txt`](./particle-browser-proof-evidence.txt)
7. [`particle-browser-comparison-proof-evidence.txt`](./particle-browser-comparison-proof-evidence.txt)
8. [`particle-parity-rollback-evidence.txt`](./particle-parity-rollback-evidence.txt)
9. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

