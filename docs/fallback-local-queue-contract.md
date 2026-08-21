# NovaSocial Fallback Local Queue Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the pure local media-deletion fallback queue writer.

## Contract

`_fallbackLocalQueue(mediaUrl, source, reason)` reads the `_mediaDeleteFallback` local-storage key, defaults to an empty array, appends an object containing the supplied `mediaUrl`, `source`, `reason`, and a current timestamp, and serializes the queue back to the same key.

When the queue exceeds 500 entries, it removes the oldest 100 entries. Storage and parsing failures are caught and logged through the existing warning without escaping. The helper does not perform deletion, network requests, retries, or protected media-system operations; it only records a local fallback item.

The harness is static and documentation-only. It does not access browser storage or enqueue media.

## Harness coverage

`docs/fallback-local-queue-contract-harness.js` validates the function signature, storage key, empty-array fallback, append payload, timestamp, 500-item cap, oldest-100 trim, JSON write, and warning-only error handling.

## References

1. [`fallback-local-queue.js`](../src/features/fallback-local-queue.js)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

