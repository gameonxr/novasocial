# NovaSocial Media Frame-Loop Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Preserve the animation-frame and timed-stop safety pattern used by browser video compression and trimming helpers.

## Contract

`_compressVideo()` and `trimVideo()` both draw video frames into a capture canvas through a guarded `requestAnimationFrame(draw)` loop. The loop must check a `drawing` flag before drawing, and the timed stop path must set that flag to `false` before pausing the video and stopping the recorder. This prevents additional frame work after the recording window closes.

The helpers also retain their existing failure/cleanup boundaries: compression revokes its object URL on stop, recorder error, and outer error paths; trimming retains its existing recorder stop and Promise rejection paths. This contract does not execute MediaRecorder, canvas, AudioContext, object URLs, or real video files.

## Harness coverage

`docs/media-frame-loop-contract-harness.js` statically checks both extracted helpers for guarded frame loops, timed shutdown ordering, recorder control, and the compression object-URL cleanup markers. It does not access the browser, create media, start a recorder, or change timing values.

| Check | Expected behavior | Result |
|---|---|---|
| Compression frame loop | Guarded `requestAnimationFrame(draw)` loop | PASS |
| Trim frame loop | Guarded `requestAnimationFrame(draw)` loop | PASS |
| Compression stop order | Set drawing false, pause video, stop recorder | PASS |
| Trim stop order | Set drawing false, pause video, stop recorder | PASS |
| Failure cleanup | Existing compression URL revocation and trim rejection markers remain | PASS |

## Safe boundary

No production logic is changed by this audit. It records the media frame-loop safety pattern so future extraction or media refactors cannot create post-stop drawing loops.

## References

1. [`src/features/compress-video.js`](../src/features/compress-video.js)
2. [`src/features/trim-video.js`](../src/features/trim-video.js)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

