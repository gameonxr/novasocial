# NovaSocial Cancel Segment Picker Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the structural invariants of the extracted music-segment picker cancellation helper.

## Contract

`cancelSegmentPicker()` pauses `_segmentAudio` and clears the reference when preview audio exists, then removes `#music-segment-panel` through optional cleanup. It is a cleanup-only helper and does not confirm segments, persist note music, or own audio loading.

## Harness coverage

`docs/cancel-segment-picker-contract-harness.js` validates the cancellation function, guarded audio pause/reset, optional panel removal, and delegated media scope.

The harness is deterministic and static. It does not access audio, mutate DOM, or publish note music.

## Safe boundary

The extracted `src/features/cancel-segment-picker.js` module remains unchanged in this checkpoint. Protected media playback, segment confirmation, and note persistence systems remain untouched.

## References

1. [`cancel-segment-picker.js`](../src/features/cancel-segment-picker.js)
2. [`show-music-segment-picker.js`](../src/features/show-music-segment-picker.js)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

