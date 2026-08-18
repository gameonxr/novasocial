# NovaSocial Story Viewer Mute Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-18
**Purpose:** Record the protected Story-viewer mute toggle invariants as a standalone contract before any future refactor.

## Contract

`toggleSVMute()` flips the shared `window._svMuted` state, synchronizes the active `#sv-media video` element’s `muted` property when a video exists, and calls `renderSV()` so the viewer icon reflects the new state. The state toggle and icon rerender remain valid even when the current Story has no video element.

Repeated toggles are reversible: toggling once changes the state, and toggling again returns it to the prior state. The function does not create a media element or alter non-video Story playback.

## Harness coverage

`docs/story-viewer-mute-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Unmuted video → toggle | Set shared state and video muted to true | PASS |
| Muted video → toggle | Restore shared state and video muted to false | PASS |
| Two toggles | Return to original state and rerender twice | PASS |
| Current Story has no video | Toggle state and rerender icon without video access | PASS |

The harness is deterministic and uses mocked state/video objects only. It does not invoke real DOM, media, audio/video, Stories, timers, or account actions.

## Safe boundary

The protected `toggleSVMute()` and `renderSV()` implementations remain inline and unchanged. No Story viewer, media, or playback production code was moved or rewritten in this checkpoint.

## Validation

The standalone harness passed. The complete repository validation chain also passed, including all JavaScript syntax checks, HTML/script integration checks, every `/tmp/validate_*.py` contract validator, inline application-script syntax validation, whitespace checks, protected-function markers, script load order, Branch2 verification, and confirmation that `origin/main` remained unchanged.

## References

1. [`index.html` Story viewer mute toggle](../index.html)
2. [`CRITICAL_CONTEXT.md`](../../upload/CRITICAL_CONTEXT.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
