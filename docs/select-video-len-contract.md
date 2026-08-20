# NovaSocial Select Video Length Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the structural invariants of the extracted video-length selection UI helper.

## Contract

`selectVideoLen(s)` assigns `window._videoTrimTo`, iterates every `.vlen-pill`, treats `full` as a string match against the full option, compares other values by string representation, and applies selected white/black or unselected dark/gray styling.

The helper owns selection UI state only. Video trimming, playback, upload, persistence, and protected media execution remain outside this module.

## Harness coverage

`docs/select-video-len-contract-harness.js` validates trim-state assignment, full/number matching, pill iteration, selected/unselected styles, and UI-only scope.

The harness is deterministic and static. It does not mutate DOM, trim video, or upload media.

## Safe boundary

The extracted `src/features/select-video-len.js` module remains unchanged in this checkpoint. Protected media trimming and upload systems remain untouched.

## References

1. [`select-video-len.js`](../src/features/select-video-len.js)
2. [`cancel-segment-picker-contract.md`](./cancel-segment-picker-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

