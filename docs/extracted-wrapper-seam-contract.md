# NovaSocial Extracted Wrapper-Seam Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Preserve the two intentional extracted-to-inline wrapper seams that depend on the final classic-script load order.

## Contract

`src/features/nova-init.js` loads after the inline application script and captures `window.showApp` before wrapping it. Its wrapper must call the original `showApp` with the original arguments and schedule `initNovaFeatures` after the existing 100 ms settling delay. `src/features/like-effects.js` loads after the inline application script and captures `window.toggleLike` before wrapping it. Its wrapper must call the original toggle handler with the original arguments and invoke the existing inline `spawnLikeParticles` helper only for a new like transition.

These wrappers intentionally remain the final scripts after `smart-ranking.js`, preserving classic-script compatibility. They are seams, not independent replacements: moving them earlier, changing their captured globals, or removing their guards can silently disable initialization, like behavior, or particle effects.

## Harness coverage

`docs/extracted-wrapper-seam-contract-harness.js` statically verifies the wrapper capture, guard, delegation, argument forwarding, particle condition, 100 ms initialization delay, and required HTML order. It does not execute the UI, attach listeners, call Supabase, authenticate, or mutate likes.

| Check | Expected behavior | Result |
|---|---|---|
| `showApp` seam | Capture, guard, delegate with arguments, schedule initialization after 100 ms | PASS |
| `toggleLike` seam | Capture, guard, delegate with arguments, preserve like-state comparison | PASS |
| Particle seam | Call inline `spawnLikeParticles` only on a new like | PASS |
| Script order | `smart-ranking` → `nova-init` → `like-effects` after inline code | PASS |
| Production changes | None | PASS |

## Safe boundary

No production code is changed by this audit. The contract records the existing wrapper behavior so future high-risk extraction or load-order changes cannot silently break the intentional global seams.

## References

1. [`src/features/nova-init.js`](../src/features/nova-init.js)
2. [`src/features/like-effects.js`](../src/features/like-effects.js)
3. [`dependency-loading-order-contract.md`](./dependency-loading-order-contract.md)
4. [`index.html`](../index.html)

