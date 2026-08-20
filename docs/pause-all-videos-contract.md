# NovaSocial Pause All Videos Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the structural invariants of the extracted low-risk video pause utility.

## Contract

`pauseAllVideos()` selects all rendered `video` elements and attempts to pause each one. Each pause call is individually guarded so one failing media element does not prevent the remaining elements from being processed.

The helper owns DOM-level pause coordination only. Video loading, playback policy, media lifecycle, and protected Reels/Calls behavior remain outside this module.

## Harness coverage

`docs/pause-all-videos-contract-harness.js` validates video selection, per-element pause iteration, exception tolerance, and DOM-only scope.

The harness is deterministic and static. It does not query the DOM or pause media.

## Safe boundary

The extracted `src/features/pause-all-videos.js` module remains unchanged in this checkpoint. Protected Reels, Calls, and media playback systems remain untouched.

## References

1. [`pause-all-videos.js`](../src/features/pause-all-videos.js)
2. [`init-video-observer-contract.md`](./init-video-observer-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

