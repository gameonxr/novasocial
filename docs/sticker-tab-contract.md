# NovaSocial Sticker Tab Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the structural invariants of the extracted sticker-picker tab renderer.

## Contract

`showStickerTab(tab)` updates `activeStickerTab`, resets the three tab headers, activates the selected header, and exits safely when `sticker-content` is absent. It reads favorite and recent sticker arrays from local storage, resets `window._stickerUrls`, and renders Recent, Favorites, or Search GIF content.

Recent and Favorites preserve empty states, three-column grids, indexed `stickerSend` delegation, and indexed `stickerToggleFav` delegation. Search preserves the GIF search input, `searchGiphy` input delegation, and trending initialization. The renderer does not own sticker sending, favorite persistence, or GIF API behavior.

## Harness coverage

`docs/sticker-tab-contract-harness.js` validates tab activation, local list reads, safe missing-content handling, Recent/Favorites empty states, indexed grid delegation, Search GIF controls, and renderer-only scope.

The harness is deterministic and static. It does not access local storage, render DOM, send stickers, mutate favorites, or call GIF services.

## Safe boundary

The extracted `src/features/sticker-tab.js` module remains unchanged in this checkpoint. Sticker send, favorite persistence, GIF search, upload, and protected messaging systems remain untouched.

## References

1. [`sticker-tab.js`](../src/features/sticker-tab.js)
2. [`open-sticker-picker-contract.md`](./open-sticker-picker-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

