# NovaSocial Update My Following Count Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the extracted optimistic following-count DOM updater.

## Contract

`updateMyFollowingCount(delta)` looks up `#following-count` and performs no DOM mutation when the element is absent. When present, it parses the element's `data-raw` value with a zero fallback, adds `delta`, clamps the result to a minimum of zero, stores the clamped value back in `data-raw`, and renders `fmt(raw)` as the text content.

The helper owns optimistic count presentation only. Server mutation, reconciliation, persistence, and profile/network behavior remain outside this module. Existing numeric coercion and formatting behavior are documented rather than changed.

## Harness coverage

`docs/update-my-following-count-contract-harness.js` validates guarded lookup, raw-count parsing, delta application, nonnegative clamp, dataset update, formatted text rendering, and non-ownership of network or persistence behavior.

## References

1. [`update-my-following-count.js`](../src/features/update-my-following-count.js)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

