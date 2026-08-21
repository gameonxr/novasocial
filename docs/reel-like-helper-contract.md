# NovaSocial Reel Like Helper Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the extracted Reels double-like animation helper without moving the protected Reels renderer.

## Contract

`dblLikeReel(pid, cont)` looks up the like button for `pid` and delegates to `toggleLike(pid)` only when the element exists and is not already marked liked.

It schedules six heart elements at 100-millisecond intervals. Each heart is appended to `cont` with the existing heart-pop styling and a delayed 800-millisecond removal. The helper owns double-like visual feedback only; like persistence, Reels rendering/navigation, and media lifecycle remain outside this module and protected Reels systems remain inline.

The harness is static and does not create DOM nodes, send likes, open Reels, or start timers. Existing animation timing and random positioning are documented rather than changed.

## Harness coverage

`docs/reel-like-helper-contract-harness.js` validates liked-state guard, toggleLike delegation, six scheduled hearts, interval timing, animation styling, container append, cleanup delay, and protected renderer boundaries.

## References

1. [`reel-like-helper.js`](../src/features/reel-like-helper.js)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

