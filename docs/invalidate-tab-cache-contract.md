# NovaSocial Tab-Cache Invalidation Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-24
**Purpose:** Record detached evidence for the extracted in-memory tab-cache invalidation owner.

## Contract

`window.invalidateTabCache(tab)` deletes only the requested key from the existing `_tabCache` object. It preserves all other cached tab entries, tolerates missing keys without throwing, and remains available as a classic-script global for existing callers.

The owner is in-memory only. It does not access the DOM, database, network, browser storage, account state, messaging, navigation, media, permissions, or external services. Cache restoration, cache reads, tab rendering, and navigation decisions remain outside this tiny invalidation owner.

## Harness coverage

`docs/invalidate-tab-cache-contract-harness.js` loads `src/features/invalidate-tab-cache-owner.js` in a detached VM with a synthetic cache object, invokes the global owner, and verifies exact-key deletion, preservation of unrelated keys, missing-key tolerance, global availability, and zero protected side effects.

| Scenario | Expected behavior | Result |
|---|---|---|
| Global owner | Expose `window.invalidateTabCache` as a callable classic global | PASS |
| Exact deletion | Remove only the requested cache key | PASS |
| Preservation | Keep unrelated cache entries unchanged | PASS |
| Missing key | Treat an absent key as a no-op | PASS |
| Scope | Remain in-memory-only with no protected effects | PASS |

## Safe boundary

The existing `src/features/invalidate-tab-cache-owner.js` module remains unchanged. This checkpoint adds only detached contract evidence for its exact-key cache invalidation. Cache restoration, account/session state, DOM rendering, navigation, database/network behavior, and protected feature systems remain outside this contract.

## Validation

The standalone harness must pass with contract-artifact pairing, cache/navigation contracts, protected-inline parity, the full Branch2 regression gate, and clean published-tip checks. This contract does not authorize live application navigation or account/cache mutation.

## References

1. [`invalidate-tab-cache-owner.js`](../src/features/invalidate-tab-cache-owner.js)
2. [`cache-restore-contract.md`](./cache-restore-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
