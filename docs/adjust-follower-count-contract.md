# NovaSocial Adjust Follower Count Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the structural invariants of the extracted optimistic follower-count DOM updater.

## Contract

`adjustFollowerCount(delta)` resolves `#followers-count` and returns safely when it is absent. It derives the next raw count from `data-raw` plus `delta`, clamps the value to zero or greater, writes the raw value back to `data-raw`, and formats the visible text through `fmt(raw)`.

The helper is DOM-only in this checkpoint. Follow persistence, authorization, network requests, and profile mutation remain outside this module.

## Harness coverage

`docs/adjust-follower-count-contract-harness.js` validates guarded lookup, raw-count arithmetic, nonnegative clamping, dataset preservation, and formatted display delegation.

The harness is deterministic and static. It does not mutate DOM or follower state.

## Safe boundary

The extracted `src/features/adjust-follower-count.js` module remains unchanged in this checkpoint. Follow and profile persistence systems remain untouched.

## References

1. [`adjust-follower-count.js`](../src/features/adjust-follower-count.js)
2. [`profile-count-refresh-contract.md`](./profile-count-refresh-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

