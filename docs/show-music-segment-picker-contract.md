# NovaSocial Show Music Segment Picker Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the structural invariants of the extracted note-music segment-picker renderer.

## Contract

`showMusicSegmentPicker(title, artist, artwork, previewUrl)` stops existing preview audio, removes any `music-search-panel`, creates the `music-segment-panel` full-screen surface, and renders the Choose Part header with Cancel and Done delegation.

The renderer preserves artwork URL expansion from `60x60` to `300x300`, title/artist metadata, preview delegation through `toggleSegmentPreview`, a 50-bar waveform scaffold, the draggable `drag-window`, initial `0:00 - 0:08` label, and post-mount initialization through `_segmentStartSec = 0` and `setupSegmentDragWindow(previewUrl)`. Audio playback, segment confirmation, and persistence remain delegated.

## Harness coverage

`docs/show-music-segment-picker-contract-harness.js` validates preview cleanup, panel structure, metadata/artwork rendering, Cancel/Done delegation, preview control, waveform/drag scaffold, initial timing, and renderer-only scope.

The harness is deterministic and static. It does not create DOM, play audio, drag the selection, confirm segments, or persist note music.

## Safe boundary

The extracted `src/features/show-music-segment-picker.js` module remains unchanged in this checkpoint. Protected media playback, drag execution, segment confirmation, and note persistence systems remain untouched.

## References

1. [`show-music-segment-picker.js`](../src/features/show-music-segment-picker.js)
2. [`cancel-segment-picker-contract.md`](./cancel-segment-picker-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

