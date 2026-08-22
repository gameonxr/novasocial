# NovaSocial Particle Seam Preparation Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Purpose:** Prepare a reversible, test-only seam for the protected like-particle effect without extracting or modifying production particle code.

## Current owner

The inline `spawnLikeParticles(el)` function in `index.html` remains the sole production owner. It is protected because it runs at the visual edge of like interactions and depends on live DOM geometry, body insertion, CSS custom properties, timers, and cleanup callbacks.

## Proposed seam

A future adapter may accept a target element plus injected dependencies for geometry access, particle creation, body insertion, randomness, timer scheduling, and cleanup. The adapter must preserve the current owner’s null-target no-op and must not own like persistence, post state, authentication, navigation, or database writes.

The explicit **test-only adapter boundary** is: `target` plus injected `geometry`, `createElement`, `appendToBody`, `random`, `setTimeout`, and `remove` dependencies in; particle element mutations and scheduled cleanup observations out. This boundary is a comparison seam only. It must not be imported by `index.html`, assigned to `window.spawnLikeParticles`, or used as a second production owner before before/after proof approval.

| Boundary | Required invariant | Proof input |
|---|---|---|
| Target guard | Missing target creates no particles and schedules no timers | `null` target mock |
| Geometry | Twelve particles begin at the target center | Fixed bounding rectangle |
| Palette/vectors | Existing palette and radial transform behavior remain stable | Deterministic random stream |
| DOM insertion | Every particle uses `.particle` and is appended to `document.body` | Mock body and element factory |
| Cleanup | Every particle schedules 800 ms removal and removes itself | Captured timer callbacks |
| Integration | Like persistence remains outside the seam | No database or like handler calls |
| Proof inventory | Browser particle mock, parity/rollback, and current baseline revalidation remain present with PASS markers | Existing evidence |

## Candidate selection

Particle is the first candidate for any future protected-split proof because its owner is isolated from database writes, authentication, navigation, microphone/camera access, subscriptions, and realtime state. The next permitted checkpoint is test-only seam preparation plus before/after static snapshot design using the explicit adapter boundary below; it must not move `spawnLikeParticles()` or introduce a second production owner.

| Candidate control | Required status |
|---|---|
| Risk scope | Visual DOM/timer effect only; no persistence or account side effects |
| Preparation boundary | Injected geometry, element factory, body insertion, randomness, timer, and cleanup dependencies in test-only design |
| Production owner | `index.html` inline `spawnLikeParticles(el)` remains sole owner |
| Approval status | Not approved; browser proof and before/after production parity remain required |
| Stop condition | Any marker, timing, cleanup, or DOM difference stops the candidate |

## Test-only adapter comparison checklist

| Comparison | Required observation |
|---|---|
| Owner isolation | The inline `spawnLikeParticles(el)` definition remains exactly once in `index.html`; no adapter is imported by production HTML |
| Dependency injection | Geometry, element creation, body insertion, randomness, timer scheduling, and cleanup are supplied by the test boundary only |
| Behavioral parity | Null-target guard, twelve-particle count, target-center geometry, palette/vector mutations, and 800 ms cleanup match the inline contract |
| Side-effect exclusion | No like persistence, database, authentication, navigation, realtime, or media API calls occur |
| Approval gate | Comparison remains unapproved until reversible browser proof and before/after production marker parity pass |
| Comparison harness | Test-only reference adapter observations match inline owner observations and cleanup delays | PASS |
| Cleanup replay | Replaying captured cleanup callbacks is harmless and leaves every test particle removed | PASS |
| Failure boundary | An injected body-append failure surfaces before timer scheduling and does not change the inline owner | PASS |


## Pre-approval gate

The particle candidate may not enter production-split execution until every gate below is satisfied. Current preparation has only completed the test-only and baseline prerequisites; no production split has been attempted.

| Approval check | Current status | Required evidence |
|---|---|---|
| Current inline baseline | PASS | 213/213/212 script counts, one inline owner, required markers, zero protected source matches |
| Test-only adapter comparison | PASS | Deterministic observations and cleanup delays match the inline owner |
| Browser mock restoration | PASS | Temporary DOM/timer APIs restore and existing particle browser proof remains PASS |
| After-split production parity | NOT RUN | Before/after marker, load-order, behavior, and source-ownership comparison |
| Rollback-after-split proof | NOT RUN | Revert to the prior Branch2 commit and rerun the protected checks |
| Approval decision | NOT READY | Keep `PROOF_STATUS=REMAINING` and `DIRECT_EXTRACTION=BLOCKED_UNTIL_SEAM_PROOF` |

## Reversible proof procedure

The following procedure is defined for a future proof run and is **not executed by this checkpoint**. It must be performed on `Branch2` with no login, permission request, like action, database write, media access, or account mutation.

| Step | Required control | Current status |
|---|---|---|
| Baseline capture | Record the candidate commit, script counts, inline owner count, required particle markers, and zero protected `src/` matches | Prepared; current baseline revalidated |
| Mock comparison | Run the deterministic browser mock and test-only injected adapter comparison with all temporary globals restored in `finally` | PASS |
| Candidate proof | If and only if approved later, compare before/after marker, load-order, DOM, timing, cleanup, and owner snapshots | NOT RUN |
| Rollback | Restore the prior Branch2 commit and rerun the baseline and mock checks; never force-push or alter `main` | NOT RUN |
| Stop rule | Any mismatch, unexpected side effect, or failed restoration aborts the candidate and keeps extraction blocked | LOCKED |

## Readiness gate

This is a seam-preparation checkpoint only. Two non-destructive proof artifacts now cover the browser particle mock and parity/rollback checks, with the parity artifact revalidated against the current Branch2 baseline. They establish reversible mock behavior and rollback readiness only; they are not before/after production-split proof. Before any production split, the project still requires before/after protected-marker parity for the selected adapter, a reversible browser smoke test attached to the like flow, a small Branch2-only implementation checkpoint, and the complete regression gate. Until then, `spawnLikeParticles()` must remain inline and the global `DIRECT_EXTRACTION=BLOCKED_UNTIL_SEAM_PROOF` policy remains active.

## Harness coverage

`docs/particle-seam-preparation-contract-harness.js` statically verifies the inline owner, exact protected boundaries, existing particle contract/harness, the two passing non-destructive proof artifacts, deterministic mock requirements, proposed adapter inputs, the test-only comparison checklist, and zero extracted protected particle owners. The existing behavior harness executes the injected reference adapter comparison, harmless cleanup-callback replay, and injected append-failure branch with deterministic DOM/timer dependencies; it does not create production modules, trigger likes, or modify production code.

## References

1. [`index.html`](../index.html)
2. [`spawn-like-particles-contract.md`](./spawn-like-particles-contract.md)
3. [`spawn-like-particles-contract-harness.js`](./spawn-like-particles-contract-harness.js)
4. [`high-risk-extraction-gate-contract.md`](./high-risk-extraction-gate-contract.md)
5. [`high-risk-seam-readiness-matrix-contract.md`](./high-risk-seam-readiness-matrix-contract.md)
6. [`particle-browser-proof-evidence.txt`](./particle-browser-proof-evidence.txt)
7. [`particle-parity-rollback-evidence.txt`](./particle-parity-rollback-evidence.txt)
8. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

