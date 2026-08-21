# NovaSocial Search Giphy Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the debounced GIF search controller without issuing an external request.

## Contract

`searchGiphy(q)` clears the prior debounce timer, locates `#giphy-results`, and returns without mutation when the result element is absent. An empty trimmed query clears the result area immediately. A non-empty query renders a loading state and schedules a 500-millisecond fetch.

The request targets the Giphy GIF search endpoint, URL-encodes the query, requests 12 results, and applies `pg` rating. Results render the fixed-height-small thumbnail URL, preserve the original URL in `data-url`, and delegate clicks to `sendGif(this)`. Empty results and request failures render their respective states.

The harness is static and documentation-only. It does not access the Giphy endpoint, render GIFs, or send a message.

## Harness coverage

`docs/search-giphy-contract-harness.js` validates debounce behavior, result guard, empty/loading/no-result/error states, endpoint and query parameters, twelve-result limit, encoded query, thumbnail/original URL mapping, and sendGif delegation.

## References

1. [`search-giphy.js`](../src/features/search-giphy.js)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

