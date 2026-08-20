# NovaSocial Sticker Toggle Favorite Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the structural invariants of the extracted sticker-picker favorite toggle.

## Contract

`stickerToggleFav(idx)` resolves the sticker URL from `window._stickerUrls[idx]` and returns safely when the index has no URL. It reads the `fav_stickers` list, removes an existing URL or prepends a new one, shows the corresponding toast, and persists the updated list.

When the active tab is Favorites, the helper refreshes through `showStickerTab('fav')`. Otherwise, it updates the indexed `fav-btn-${idx}` button to `☆` or `⭐` when that button exists. It owns favorite-toggle feedback only and delegates picker rendering.

## Harness coverage

`docs/sticker-toggle-fav-contract-harness.js` validates indexed lookup, missing-index guard, add/remove branches, favorite persistence, active-tab refresh, optional button feedback, and local-only scope.

The harness is deterministic and static. It does not access local storage, render DOM, or mutate picker state.

## Safe boundary

The extracted `src/features/sticker-toggle-fav.js` module remains unchanged in this checkpoint. Sticker sending, picker rendering, uploads, and protected messaging systems remain untouched.

## References

1. [`sticker-toggle-fav.js`](../src/features/sticker-toggle-fav.js)
2. [`sticker-tab-contract.md`](./sticker-tab-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

