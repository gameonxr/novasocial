# NovaSocial Save Local Sticker Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the structural invariants of the extracted local-sticker recents writer.

## Contract

`saveLocalSticker(type, url)` obtains the current list through `getLocalStickers(type)`. It adds a URL only when it is not already present, inserts new URLs at the front, trims the list to at most 20 items, and persists the resulting JSON array under `${type}_stickers`.

The helper is local-only and intentionally delegates malformed-data handling to `getLocalStickers`. It does not render UI, send stickers, upload media, or contact remote services.

## Harness coverage

`docs/save-local-sticker-contract-harness.js` validates duplicate suppression, newest-first insertion, 20-item cap behavior, dynamic key derivation, delegated list loading, and local-only scope.

The harness is deterministic and static. It does not access browser storage or mutate runtime sticker data.

## Safe boundary

The extracted `src/features/save-local-sticker.js` module remains unchanged in this checkpoint. Sticker UI, sending, uploads, and protected messaging systems remain untouched.

## References

1. [`save-local-sticker.js`](../src/features/save-local-sticker.js)
2. [`get-local-stickers-contract.md`](./get-local-stickers-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

