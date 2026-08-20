# NovaSocial Video Observer Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Preserve the extracted video-visibility behavior used by Home/feed media rendering.

## Contract

`initVideoObserver()` creates one `IntersectionObserver`, selects the current document’s video elements, observes every selected video, and pauses only entries that are no longer intersecting. It does not pause visible videos, remove videos, change playback sources, or own the feed DOM. Home/feed rendering retains its existing delayed call to `initVideoObserver()` after media insertion.

The observer is intentionally a lightweight behavior helper. This contract does not introduce observer reuse, disconnect semantics, autoplay policy changes, or a new media lifecycle; any such change requires a separate compatibility review.

## Harness coverage

`docs/video-observer-contract-harness.js` loads `src/features/init-video-observer.js` in a deterministic VM with mocked videos and `IntersectionObserver`. It verifies that all videos are observed and that an intersection callback pauses only the non-intersecting target. It also confirms the Home module retains its observer call. No real DOM, video, browser observer, network, or authentication is used.

| Check | Expected behavior | Result |
|---|---|---|
| Video selection | Select current `video` elements | PASS |
| Observer registration | Observe every selected video | PASS |
| Visible media | Do not pause intersecting videos | PASS |
| Off-screen media | Pause non-intersecting videos | PASS |
| Home integration | Retain `initVideoObserver()` call after rendering | PASS |

## Safe boundary

No production logic is changed by this audit. The contract records the current observer behavior so future extraction or feed-render changes cannot silently remove off-screen playback control.

## References

1. [`src/features/init-video-observer.js`](../src/features/init-video-observer.js)
2. [`src/features/home.js`](../src/features/home.js)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

