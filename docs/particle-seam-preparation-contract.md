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

## Readiness gate

This is a seam-preparation checkpoint only. Before any production split, the project still requires before/after protected-marker parity, a reversible browser smoke test attached to the like flow, a small Branch2-only implementation checkpoint, and the complete regression gate. Until then, `spawnLikeParticles()` must remain inline and the global `DIRECT_EXTRACTION=BLOCKED_UNTIL_SEAM_PROOF` policy remains active.

## Harness coverage

`docs/particle-seam-preparation-contract-harness.js` statically verifies the inline owner, exact protected boundaries, existing particle contract/harness, deterministic mock requirements, proposed adapter inputs, and zero extracted protected particle owners. It does not create DOM nodes, invoke animations, trigger likes, or modify production code.

## References

1. [`index.html`](../index.html)
2. [`spawn-like-particles-contract.md`](./spawn-like-particles-contract.md)
3. [`spawn-like-particles-contract-harness.js`](./spawn-like-particles-contract-harness.js)
4. [`high-risk-extraction-gate-contract.md`](./high-risk-extraction-gate-contract.md)
5. [`high-risk-seam-readiness-matrix-contract.md`](./high-risk-seam-readiness-matrix-contract.md)
6. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

