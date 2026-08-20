# NovaSocial Toggle Segment Preview Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the structural invariants of the extracted segment-picker preview controller.

## Contract

`toggleSegmentPreview(url)` obtains `#segment-play-icon`. If shared segment audio exists and is currently playing, it pauses the audio, restores the play polygon, and returns.

When audio is absent, the helper creates `new Audio(url)`. It applies `window._segmentStartSec || 0` as the current time, starts playback with the existing failure toast, switches the icon to pause bars, and installs an ended handler restoring the play polygon. Existing audio is reused on subsequent starts.

The helper owns segment preview interaction only. Segment selection, drag state, note persistence, and audio-state declarations remain outside the module. Existing assumptions about the icon element and platform playback behavior are documented rather than changed.

## Harness coverage

`docs/toggle-segment-preview-contract-harness.js` validates icon lookup, active pause branch, audio creation/reuse, start offset, playback and failure handling, icon transitions, ended cleanup, and non-ownership of persistence/network behavior.

The harness is static and deterministic. It does not create or play audio.

## References

1. [`toggle-segment-preview.js`](../src/features/toggle-segment-preview.js)
2. [`show-music-segment-picker.js`](../src/features/show-music-segment-picker.js)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

