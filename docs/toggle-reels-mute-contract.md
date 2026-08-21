# NovaSocial Toggle Reels Mute Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the extracted Reels mute UI toggle without moving the protected Reels renderer.

## Contract

`toggleReelsMute()` inverts the global `reelsMuted` state, looks up the current video by `rv-${currentReelIdx}`, and, when present, applies the muted state. When unmuting, it delegates playback through `v.play().catch(()=>{})`; when muting, no playback call is made.

It updates every `.mute-icon` with the corresponding mute/unmute icon and displays the matching muted or sound-on toast. The helper owns this control's UI/media state only; Reels rendering, navigation, feed loading, and protected Reels lifecycle remain inline and outside this audit.

The harness is static and does not open Reels, play media, or alter playback state. Existing silent playback rejection is documented rather than changed.

## Harness coverage

`docs/toggle-reels-mute-contract-harness.js` validates state inversion, current-video lookup, guarded mute assignment, unmute playback delegation, icon updates, toast branches, and protected renderer boundaries.

## References

1. [`toggle-reels-mute.js`](../src/features/toggle-reels-mute.js)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

