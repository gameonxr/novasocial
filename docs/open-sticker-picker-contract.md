# NovaSocial Open Sticker Picker Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the structural invariants of the extracted sticker-picker modal setup before any future migration of sticker behavior.

## Contract

`openStickerPicker(cid)` stores the conversation identifier in `window._stickerCid`, resets `activeStickerTab` to `recent`, opens the shared `Stickers & GIFs` modal, clears `#mbody`, and renders the upload control, three tabs, and `sticker-content` container. The hidden file input preserves `image/*` acceptance and delegates to `uploadCustomSticker` with the current `cid`.

After rendering, the picker initializes through `showStickerTab('recent')`. The helper owns modal assembly and tab entry only; sticker sending, favorites persistence, custom upload processing, and GIF search remain delegated to their existing owners.

## Harness coverage

`docs/open-sticker-picker-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Conversation scope | Preserve `cid` in `_stickerCid` and upload delegation | PASS |
| Modal | Use the shared Stickers & GIFs modal and `#mbody` | PASS |
| Upload | Preserve hidden image file input and custom-upload callback | PASS |
| Tabs | Preserve Recent, Favorites, and Search GIFs tab entry points | PASS |
| Content | Preserve `sticker-content` container and Recent initialization | PASS |
| Scope | Keep send, favorites, persistence, upload processing, and GIF search outside setup ownership | PASS |

The harness is deterministic and static. It does not open the modal, upload files, send stickers, mutate local storage, or call external GIF services.

## Safe boundary

The extracted `src/features/open-sticker-picker.js` module remains unchanged in this checkpoint. Sticker send, favorite, persistence, upload, and protected messaging systems remain untouched.

## Validation

The standalone harness must pass with all JavaScript syntax checks, every current contract harness, `/tmp/validate_*.py` validators, inline-script validation, whitespace checks, and explicit Branch2/main reference checks.

## References

1. [`open-sticker-picker.js`](../src/features/open-sticker-picker.js)
2. [`sticker-favorites-contract.md`](./sticker-favorites-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

