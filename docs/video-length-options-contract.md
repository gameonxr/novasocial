# NovaSocial Video-Length Options Renderer Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-25
**Purpose:** Record detached evidence for the isolated video-length preset renderer without executing media trimming, upload, persistence, or playback behavior.

## Contract

`showVideoLengthOptions(dur)` reads the existing `vlenpick` and `vlen-opts` containers, renders duration presets from the fixed `[15, 30, 60, 90, 180]` list, and preserves the existing `selectVideoLen(...)` callback wiring. For durations at or below `MAX_VIDEO_LEN`, it adds the full-length option and resets local `_videoTrimTo` to `null`. For longer durations, it sets the local default selection to `180`, shows the existing length-choice toast, and schedules the existing local selection callback. Missing containers remain a no-op.

This contract covers only the renderer and local selection-state preparation already isolated in `src/features/video-length-options.js`. Actual media trimming, preview playback, file handling, upload, persistence, account state, network/database access, and protected creation behavior remain outside this contract.

## Harness coverage

`docs/video-length-options-contract-harness.js` loads the renderer in a detached VM with synthetic container, timer, toast, and selection-callback mocks. It verifies global availability, numeric preset filtering, full-length markup, long-duration defaults, display state, toast behavior, deferred selection delegation, missing-container tolerance, and zero media side effects.

| Scenario | Expected behavior | Result |
|---|---|---|
| Standard duration | Render eligible numeric presets and a full-length option | PASS |
| Standard state | Reset local `_videoTrimTo` to `null` and show the picker | PASS |
| Long duration | Set local default trim selection to `180` and show the choice toast | PASS |
| Deferred selection | Delegate `180` through the existing selection callback without trimming media | PASS |
| Missing containers | Return without DOM or external side effects | PASS |
| Scope | Keep trimming, playback, file, upload, persistence, and network behavior outside the renderer | PASS |

## Safe boundary

The existing `src/features/video-length-options.js` module remains unchanged. This checkpoint adds only detached evidence for its preset renderer and local selection preparation. Media trimming, preview playback, uploads, persistence, account state, and protected creation flows remain untouched.

## Validation

The standalone harness must pass with the existing `selectVideoLen` contract, segment/window contracts, contract-artifact pairing, protected-inline parity, the full Branch2 regression gate, and clean published-tip checks. This contract does not authorize opening media devices, trimming a real file, uploading media, changing an account, or navigating a live application.

## References

1. [`video-length-options.js`](../src/features/video-length-options.js)
2. [`select-video-len-contract.md`](./select-video-len-contract.md)
3. [`segment-drag-window-contract.md`](./segment-drag-window-contract.md)
4. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
