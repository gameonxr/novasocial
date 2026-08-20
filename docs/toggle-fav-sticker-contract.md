# NovaSocial Toggle Favorite Sticker Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the structural invariants of the extracted sticker favorite toggle.

## Contract

`toggleFavSticker(url, e, btn)` stops event propagation when an event is provided so sticker sending is not triggered. It obtains favorites through `getLocalStickers('fav')`, removes an existing URL or prepends a new URL, updates the optional button to `☆` or `⭐`, shows the corresponding toast, and persists the resulting favorite list under `fav_stickers`.

The helper owns local favorite state and button feedback only. It does not send stickers, render the picker, contact remote services, or own protected messaging behavior.

## Harness coverage

`docs/toggle-fav-sticker-contract-harness.js` validates event propagation handling, delegated reads, add/remove branches, button feedback, toast messages, persistence key, and local-only scope.

The harness is deterministic and static. It does not access browser storage, trigger events, update buttons, or send stickers.

## Safe boundary

The extracted `src/features/toggle-fav-sticker.js` module remains unchanged in this checkpoint. Sticker sending, picker rendering, upload, and protected messaging systems remain untouched.

## References

1. [`toggle-fav-sticker.js`](../src/features/toggle-fav-sticker.js)
2. [`get-local-stickers-contract.md`](./get-local-stickers-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

