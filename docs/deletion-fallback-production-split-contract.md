# NovaSocial Deletion-Fallback Production Split Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Purpose:** Record the completed, reversible production split of the protected local deletion-fallback owner while preserving the inline media-deletion boundary and the startup global handoff.

## Approved change

The inline `syncLocalDeletionFallback()` owner was moved from `index.html` into `src/features/sync-local-deletion-fallback.js` as an async function assigned to `window.syncLocalDeletionFallback`. The module is loaded after `src/features/spawn-like-particles.js` and immediately before `src/features/like-effects.js`. The startup caller remains unchanged and continues to invoke the global owner under its non-throwing guard. The inline `deleteMediaProduction()` boundary remains unchanged.

## Before/after acceptance

| Check | Before | After | Result |
|---|---:|---:|---|
| Opening script tags | 214 | 215 | PASS |
| Closing script tags | 214 | 215 | PASS |
| External script tags | 213 | 214 | PASS |
| Inline deletion-fallback owner declarations | 1 | 0 | PASS |
| Source deletion-fallback window owners | 0 | 1 | PASS |
| Other unapproved protected inline signatures | 17 | 17 | PASS |
| Canonical owner SHA-256 | `f267467785faea7ef3b8cc0c50a15764fd3bd13759a852b20e050a7887338786` | same | PASS |
| `window.syncLocalDeletionFallback` at startup | N/A | function | PASS |
| Module before global caller | N/A | true | PASS |
| Synthetic production smoke | N/A | 3 ordered calls, queue removed, storage restored | PASS |

## Rollback acceptance

The split checkpoint is revertible to the pre-split Branch2 commit `7a026d0dfb15f21da55700df644b1bc6bf205d9b`. The rollback proof must restore the inline owner, exact canonical hash, 214/214/213 script counts, and no deletion-fallback module in a detached temporary worktree. `origin/main` must remain `ef418007c9b9a797488b4825be5f0c807da22369`.

## Evidence

The associated evidence files are `deletion-fallback-browser-comparison-proof-evidence.txt` and `deletion-fallback-after-split-browser-proof-evidence.txt`. The associated seam and behavior harnesses are `deletion-fallback-seam-preparation-contract-harness.js` and `local-deletion-fallback-contract-harness.js`. The rollback proof must be recorded in `deletion-fallback-parity-rollback-evidence.txt` after the split checkpoint is published.
