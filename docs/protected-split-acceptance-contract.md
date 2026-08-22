# NovaSocial Protected Split Acceptance Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Purpose:** Provide one deterministic acceptance decision for protected production splits, authorizing only the fully verified particle and deletion-fallback checkpoints and keeping all other protected systems gated.

## Current decision

**READY FOR PARTICLE AND DELETION ONLY — the remaining 17 protected production splits remain blocked.** The repository has protected-marker parity, behavioral baselines, feature seam maps, deterministic mock harnesses, and a reversible-browser-proof checklist. Thirty-three deterministic, non-destructive browser-context mock artifacts plus particle and deletion-fallback comparison and after-split browser proofs are passing. Both owners completed controlled production splits with exact canonical hash parity, preserved global caller compatibility, clean startup, and rollback availability. No other protected production owner may move from `index.html` into `src/` until its own gate passes.

## Acceptance conditions

A future protected split may be considered only when every condition below is true for one selected subsystem and its neighboring flow.

| Condition | Required state | Current state |
|---|---|---|
| Branch safety | Change is isolated to `Branch2`; `main` is untouched | PASS |
| Baseline parity | Protected marker and load-order parity are captured before and after | PASS for particle and deletion fallback |
| Seam map | DOM, state, timing, dependency, and global ownership are documented | PASS for particle and deletion fallback; present for remaining mapped systems |
| Deterministic proof | Mock harness covers normal, failure, cleanup, and race paths | PASS for particle and deletion fallback; present for remaining mapped systems |
| Browser proof | Reversible browser smoke test passes without irreversible actions | PASS for particle and deletion fallback; not established for remaining systems |
| Rollback | Prior commit can be restored and all gates rerun cleanly | PASS for particle and deletion fallback |
| Regression | Full repository gate passes from a clean worktree | PASS for both split checkpoints |
| Production move | Only the selected owner moves, with no speculative cleanup | 2/19 moved: particle and deletion fallback |

## Stop conditions

Stop and revert the candidate checkpoint if any protected marker changes unexpectedly, a global handler disappears, load order changes, a DOM container is rebuilt instead of preserved, timing or cleanup differs, a browser scenario is not reversible, a real account or external permission would be needed, or any regression gate fails. A failed proof is evidence to stop, not permission to broaden the split.

## Harness coverage

`docs/protected-split-acceptance-contract-harness.js` verifies the particle-and-deletion-only READY decision, the 17 remaining protected inline signatures, both approved window owners, the blocked direct-extraction policy for the remaining systems, the required seam and browser-proof artifacts, and the absence of a speculative approval flag. The separate reversible-browser-proof harness inventories the 33 passing non-destructive mock artifacts plus both comparison and after-split evidence. Neither harness executes irreversible browser actions.

## References

1. [`high-risk-extraction-gate-contract.md`](./high-risk-extraction-gate-contract.md)
2. [`high-risk-seam-readiness-matrix-contract.md`](./high-risk-seam-readiness-matrix-contract.md)
3. [`reversible-browser-proof-contract.md`](./reversible-browser-proof-contract.md)
4. [`protected-inline-parity-contract.md`](./protected-inline-parity-contract.md)
5. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

