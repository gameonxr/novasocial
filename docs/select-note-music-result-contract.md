# NovaSocial Select Note Music Result Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the structural invariants of the extracted note-music result selection helper.

## Contract

`selectNoteMusicResult(title, artist, artwork, previewUrl)` first delegates preview-audio cleanup to `stopAllPreviewAudio()`. When no preview URL exists, it directly assigns `window._noteMusic` with an empty preview URL and `startSec:0`, removes `#music-search-panel` when present, rerenders the note-music section, and delegates recent-music persistence.

When a preview URL exists, it delegates to `showMusicSegmentPicker(title, artist, artwork, previewUrl)` instead of directly attaching the result. Segment selection, note persistence, recents, and audio execution remain outside this helper.

## Harness coverage

`docs/select-note-music-result-contract-harness.js` validates preview cleanup, no-preview direct state, panel cleanup, renderer/recents delegation, preview-present segment-picker delegation, and protected ownership boundaries.

The harness is deterministic and static. It does not play audio, mutate notes, save recents, or open the segment picker.

## Safe boundary

The extracted `src/features/select-note-music-result.js` module remains unchanged in this checkpoint. Protected note persistence, recents, audio playback, and segment-picker execution remain untouched.

## References

1. [`select-note-music-result.js`](../src/features/select-note-music-result.js)
2. [`show-music-segment-picker-contract.md`](./show-music-segment-picker-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

