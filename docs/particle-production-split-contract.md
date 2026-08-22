# NovaSocial Particle Production Split Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Purpose:** Record the completed, reversible production split of the protected particle owner and define the invariants required before any later protected split.

## Approved change

The inline `spawnLikeParticles(el)` owner was moved from `index.html` into `src/features/spawn-like-particles.js` as an anonymous function assigned to `window.spawnLikeParticles`. The module is loaded immediately before `src/features/like-effects.js`, whose global call remains unchanged. No other protected owner was moved.

## Before/after acceptance

| Check | Before | After | Result |
|---|---:|---:|---|
| Opening script tags | 213 | 214 | PASS |
| Closing script tags | 213 | 214 | PASS |
| External script tags | 212 | 213 | PASS |
| Inline particle owner declarations | 1 | 0 | PASS |
| Source particle window owners | 0 | 1 | PASS |
| Other protected inline signatures | 18 | 18 | PASS |
| Canonical owner SHA-256 | `44952efebe4daed59f18b3367561cc604b0cce3ea9d9092d1ff41d0bb541fb57` | same | PASS |
| `window.spawnLikeParticles` at startup | N/A | function | PASS |
| Module before global caller | N/A | true | PASS |
| Synthetic production smoke | N/A | 12 created, 0 after 850 ms | PASS |

## Rollback acceptance

The split was published as commit `07b81feccb59b5779439f0ff9169e3430a51835b`, whose parent is the pre-split evidence checkpoint `cc72374b89313f667a91310a820bc306c419e1d3`. Both commits are available in the Branch2 history, the worktree is clean, and `origin/main` remains `ef418007c9b9a797488b4825be5f0c807da22369`. The split is therefore revertible without a force-push or any change to main.

The rollback proof was executed in a detached temporary worktree by reverting the split commit; the exact inline baseline owner/hash/counts were restored and the rollback baseline proof passed. The published split’s production checks and complete Branch2 regression gate pass; this contract does not authorize moving any of the remaining 17 protected systems.

## Evidence

The associated evidence files are `particle-browser-comparison-proof-evidence.txt`, `particle-after-split-browser-proof-evidence.txt`, and `particle-parity-rollback-evidence.txt`. The associated harness is `particle-production-split-contract-harness.js`.
