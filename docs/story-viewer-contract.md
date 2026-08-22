# NovaSocial Stories Viewer Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-18
**Purpose:** Record the fragile Stories viewer navigation, playback, timer, and gesture invariants as a standalone contract before any future refactor.

## Contract

`openSV(startIdx)` groups the existing `svData` list by `user_id` while preserving each user’s story order. It locates the requested story inside its user bucket, sets `svBucketIdx` and `svStoryIdx`, opens the viewer, and renders the selected story. The viewer must keep the bucket/story distinction: advancing within a user’s stories is different from moving to the next or previous user.

`renderSV()` stops the previous media before resetting progress and rebuilding the progress bars, header, media, overlays, gestures, and reply/viewer controls. Image stories start the 50ms progress interval only after the image loads. Video stories use `canplay`, `timeupdate`, `ended`, and `error` handlers: playback begins after readiness, progress is driven by duration, and ended/error paths advance to the next story. The shared `svTimer` is cleaned before each render and on close.

Next-story navigation advances within the current bucket, then moves to the next bucket at its first story; navigation beyond the final bucket closes the viewer. Previous-story navigation moves backward within the current bucket, then returns to the previous bucket’s last story, clamping at the first story. Next-user and previous-user navigation change buckets directly, reset the story index, and close or clamp at their respective boundaries.

Viewer gestures pause media on touch start. A downward vertical swipe greater than 100px closes the viewer. An upward vertical swipe greater than 100px opens the viewers list only for the story owner. A horizontal swipe below −50px advances to the next user, while a swipe above +50px moves to the previous user. A non-significant gesture resumes playback. The gesture implementation uses the tracked last deltas rather than reading an untracked touch-end position.

`closeSV()` stops the interval and media, pauses all videos, removes lingering Story overlay content, removes the visible/paused viewer classes, and respects the navigation-stack pop boundary. This cleanup must happen regardless of whether the viewer ends naturally, is dismissed by a gesture, or is closed through navigation.

## Harness coverage

`docs/story-viewer-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Story grouping | Preserve user buckets and story order | PASS |
| Start selection | Locate requested story inside its bucket | PASS |
| Image playback | Start timer after image load | PASS |
| Video playback | Wire canplay/timeupdate/ended/error lifecycle | PASS |
| Next story | Cross bucket at boundary; close after final story | PASS |
| Previous story | Cross bucket to prior user’s last story; clamp at start | PASS |
| Next/previous user | Reset story index and apply boundary behavior | PASS |
| Downward swipe | Close above 100px threshold | PASS |
| Upward swipe | Viewers list for owner above 100px threshold | PASS |
| Horizontal swipes | Move users beyond ±50px thresholds | PASS |
| Small gesture | Resume playback | PASS |
| Close cleanup | Clear timer, stop media, remove overlays, hide viewer | PASS |
| Injected playback dispatch | Group, render, navigate, swipe, and close dependencies dispatch explicitly in order | PASS |

The harness is deterministic and uses mocked data/events only. Its injected playback dispatcher is test-only and is not loaded by `index.html`. It does not invoke real DOM, video, timers, database, authentication, navigation, or Story actions.

## Safe boundary

The protected `openSV()`, `renderSV()`, `renderStoryElements()`, `nextSV()`, `prevSV()`, `nextUserSV()`, `prevUserSV()`, `stopSVPlayback()`, and `closeSV()` functions remain inline and unchanged. No Story viewer/editor production code was moved or rewritten in this checkpoint.

## Validation

The standalone harness passed. The complete repository validation chain also passed, including all JavaScript syntax checks, HTML/script integration checks, every `/tmp/validate_*.py` contract validator, inline application-script syntax validation, whitespace checks, protected-function markers, script load order, Branch2 verification, and confirmation that `origin/main` remained unchanged.

## References

1. [`index.html` Stories viewer implementation](../index.html)
2. [`CRITICAL_CONTEXT.md`](../../upload/CRITICAL_CONTEXT.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
