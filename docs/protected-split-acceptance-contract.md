# NovaSocial Protected Split Acceptance Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Purpose:** Provide one deterministic acceptance decision for any future protected production split without authorizing a split in the current checkpoint.

## Current decision

**NOT READY — protected production splits remain blocked.** The repository has protected-marker parity, behavioral baselines, feature seam maps, deterministic mock harnesses, and a reversible-browser-proof checklist. However, browser proof has not yet been established for a protected split, so no protected production owner may move from `index.html` into `src/`.

## Acceptance conditions

A future protected split may be considered only when every condition below is true for one selected subsystem and its neighboring flow.

| Condition | Required state | Current state |
|---|---|---|
| Branch safety | Change is isolated to `Branch2`; `main` is untouched | PASS |
| Baseline parity | Protected marker and load-order parity are captured before and after | Required before split |
| Seam map | DOM, state, timing, dependency, and global ownership are documented | Present for mapped systems |
| Deterministic proof | Mock harness covers normal, failure, cleanup, and race paths | Present for mapped systems |
| Browser proof | Reversible browser smoke test passes without irreversible actions | NOT ESTABLISHED |
| Rollback | Prior commit can be restored and all gates rerun cleanly | Required before split |
| Regression | Full repository gate passes from a clean worktree | Required at every checkpoint |
| Production move | Only the selected owner moves, with no speculative cleanup | 0/19 moved |

## Stop conditions

Stop and revert the candidate checkpoint if any protected marker changes unexpectedly, a global handler disappears, load order changes, a DOM container is rebuilt instead of preserved, timing or cleanup differs, a browser scenario is not reversible, a real account or external permission would be needed, or any regression gate fails. A failed proof is evidence to stop, not permission to broaden the split.

## Harness coverage

`docs/protected-split-acceptance-contract-harness.js` verifies the current NOT-READY decision, the 19 protected inline signatures, the blocked direct-extraction policy, the required seam and browser-proof artifacts, zero protected owners in `src/`, and the absence of a speculative approval flag. It does not execute browser actions or approve a production split.

## References

1. [`high-risk-extraction-gate-contract.md`](./high-risk-extraction-gate-contract.md)
2. [`high-risk-seam-readiness-matrix-contract.md`](./high-risk-seam-readiness-matrix-contract.md)
3. [`reversible-browser-proof-contract.md`](./reversible-browser-proof-contract.md)
4. [`protected-inline-parity-contract.md`](./protected-inline-parity-contract.md)
5. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

