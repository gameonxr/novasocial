# NovaSocial Get Local Stickers Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the structural invariants of the extracted local-sticker reader.

## Contract

`getLocalStickers(type)` reads `${type}_stickers` from `localStorage`, defaults missing values to an empty JSON array, and returns parsed sticker data when valid. If parsing fails, it removes the malformed key and returns an empty array.

The helper is intentionally local-only. It does not send stickers, contact remote services, or own UI rendering. Existing sticker persistence behavior remains unchanged.

## Harness coverage

`docs/get-local-stickers-contract-harness.js` validates valid-read, missing-key fallback, malformed-data cleanup, dynamic-key behavior, and local-only scope.

The harness is deterministic and static. It does not access the browser’s local storage or mutate runtime data.

## Safe boundary

The extracted `src/features/get-local-stickers.js` module remains unchanged in this checkpoint. Sticker UI, sending, upload, and protected messaging systems remain untouched.

## References

1. [`get-local-stickers.js`](../src/features/get-local-stickers.js)
2. [`save-local-sticker.js`](../src/features/save-local-sticker.js)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

