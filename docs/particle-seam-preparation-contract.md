# NovaSocial Particle Seam Preparation Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Purpose:** Prepare a reversible, test-only seam for the protected like-particle effect without extracting or modifying production particle code.

## Current owner

The inline `spawnLikeParticles(el)` function in `index.html` remains the sole production owner. It is protected because it runs at the visual edge of like interactions and depends on live DOM geometry, body insertion, CSS custom properties, timers, and cleanup callbacks.

## Proposed seam

A future adapter may accept a target element plus injected dependencies for geometry access, particle creation, body insertion, randomness, timer scheduling, and cleanup. The adapter must preserve the current owner’s null-target no-op and must not own like persistence, post state, authentication, navigation, or database writes.

| Boundary | Required invariant | Proof input |
|---|---|---|
| Target guard | Missing target creates no particles and schedules no timers | `null` target mock |
| Geometry | Twelve particles begin at the target center | Fixed bounding rectangle |
| Palette/vectors | Existing palette and radial transform behavior remain stable | Deterministic random stream |
| DOM insertion | Every particle uses `.particle` and is appended to `document.body` | Mock body and element factory |
| Cleanup | Every particle schedules 800 ms removal and removes itself | Captured timer callbacks |
| Integration | Like persistence remains outside the seam | No database or like handler calls |
| Proof inventory | Browser particle mock and parity/rollback artifacts remain present with PASS markers | Existing evidence |

## Candidate selection

Particle is the first candidate for any future protected-split proof because its owner is isolated from database writes, authentication, navigation, microphone/camera access, subscriptions, and realtime state. The next permitted checkpoint is test-only seam preparation plus before/after static snapshot design; it must not move `spawnLikeParticles()` or introduce a second production owner.

| Candidate control | Required status |
|---|---|
| Risk scope | Visual DOM/timer effect only; no persistence or account side effects |
| Preparation boundary | Injected geometry, element factory, body insertion, randomness, timer, and cleanup dependencies in test-only design |
| Production owner | `index.html` inline `spawnLikeParticles(el)` remains sole owner |
| Approval status | Not approved; browser proof and before/after production parity remain required |
| Stop condition | Any marker, timing, cleanup, or DOM difference stops the candidate |

## Readiness gate

This is a seam-preparation checkpoint only. Two non-destructive proof artifacts now cover the browser particle mock and parity/rollback checks. They establish reversible mock behavior and rollback readiness only; they are not before/after production-split proof. Before any production split, the project still requires before/after protected-marker parity for the selected adapter, a reversible browser smoke test attached to the like flow, a small Branch2-only implementation checkpoint, and the complete regression gate. Until then, `spawnLikeParticles()` must remain inline and the global `DIRECT_EXTRACTION=BLOCKED_UNTIL_SEAM_PROOF` policy remains active.

## Harness coverage

`docs/particle-seam-preparation-contract-harness.js` statically verifies the inline owner, exact protected boundaries, existing particle contract/harness, the two passing non-destructive proof artifacts, deterministic mock requirements, proposed adapter inputs, and zero extracted protected particle owners. It does not create DOM nodes, invoke animations, trigger likes, or modify production code.

## References

1. [`index.html`](../index.html)
2. [`spawn-like-particles-contract.md`](./spawn-like-particles-contract.md)
3. [`spawn-like-particles-contract-harness.js`](./spawn-like-particles-contract-harness.js)
4. [`high-risk-extraction-gate-contract.md`](./high-risk-extraction-gate-contract.md)
5. [`high-risk-seam-readiness-matrix-contract.md`](./high-risk-seam-readiness-matrix-contract.md)
6. [`particle-browser-proof-evidence.txt`](./particle-browser-proof-evidence.txt)
7. [`particle-parity-rollback-evidence.txt`](./particle-parity-rollback-evidence.txt)
8. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

