# NovaSocial Confirm Music Segment Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the structural invariants of the extracted segment-picker confirmation helper.

## Contract

`confirmMusicSegment(title, artist, artwork, previewUrl)` pauses and clears the shared `_segmentAudio` reference when present. It assigns `window._noteMusic` with the selected metadata, the supplied preview URL, and `startSec` sourced from `window._segmentStartSec || 0`.

The helper removes `#music-segment-panel` when present, rerenders the note-music section, and delegates recent-music persistence with the selected metadata and preview URL. Segment dragging, audio construction, note submission, and persistence implementation remain outside this module.

## Harness coverage

`docs/confirm-music-segment-contract-harness.js` validates segment-audio cleanup, selected-state assignment, fallback start time, panel cleanup, renderer delegation, recent-music delegation, and protected ownership boundaries.

The harness is static and deterministic. It does not create audio, mutate notes, or persist recents.

## References

1. [`confirm-music-segment.js`](../src/features/confirm-music-segment.js)
2. [`show-music-segment-picker.js`](../src/features/show-music-segment-picker.js)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

