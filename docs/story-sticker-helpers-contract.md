# NovaSocial Story Sticker Helpers Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the structural invariants of the extracted story-editor sticker helpers.

## Contract

`seOpenStickerTool()` displays `#se-sticker-panel`, while `seCloseStickerPanel()` hides it. `seAddSticker(emoji)` appends a sticker element with the supplied emoji, centered coordinates, default scale/rotation/font size, rerenders story elements, and closes the panel.

`seAddCustomSticker()` trims `#se-custom-sticker`, returns without mutation for empty text, and for non-empty text appends a text-sticker element with the defined typography and visual defaults. It rerenders story elements, clears the input, and closes the panel. The helper delegates final story rendering to `renderStoryElements` and owns no story persistence or publishing.

## Harness coverage

`docs/story-sticker-helpers-contract-harness.js` validates panel visibility, emoji element defaults, custom text guard, custom text element properties, rerender delegation, input cleanup, and story-only scope.

The harness is deterministic and static. It does not access DOM, mutate editor state, publish stories, or call remote services.

## Safe boundary

The extracted `src/features/story-sticker-helpers.js` module remains unchanged in this checkpoint. Protected story rendering, persistence, publishing, and media systems remain untouched.

## References

1. [`story-sticker-helpers.js`](../src/features/story-sticker-helpers.js)
2. [`story-editor-elements-contract.md`](./story-editor-elements-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

