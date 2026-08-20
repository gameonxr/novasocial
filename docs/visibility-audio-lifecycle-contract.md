# NovaSocial Visibility Audio Lifecycle Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Preserve the background-tab audio safety behavior in the protected inline Notes/media system.

## Contract

The application has one `visibilitychange` listener in the inline application script. When `document.hidden` becomes true, it pauses `_noteViewAudio`, `_previewAudio`, and `_segmentAudio` if present. The handler intentionally does not introduce a resume operation; existing feature-specific controls own later playback decisions.

This contract freezes only the current listener count, hidden-state guard, and three pause targets. It does not move the handler, add a visibility resume policy, alter Notes/Stories/Reels playback, or change the protected inline boundary.

## Harness coverage

`docs/visibility-audio-lifecycle-contract-harness.js` statically scans `index.html` and verifies one visibility listener, one hidden-state guard, and the three established audio pause targets. It does not open a browser, play audio, change document visibility, or execute any protected function.

| Check | Expected behavior | Result |
|---|---:|---|
| Visibility listeners | 1 `visibilitychange` listener | PASS |
| Background guard | `document.hidden` branch retained | PASS |
| Note-view audio | Paused when hidden if present | PASS |
| Preview audio | Paused when hidden if present | PASS |
| Segment audio | Paused when hidden if present | PASS |
| Resume behavior | No speculative resume added | PASS |

## Safe boundary

No production logic is changed by this audit. It records the existing background-audio safety boundary so future extraction cannot silently remove a pause target or invent a conflicting resume lifecycle.

## References

1. [`index.html`](../index.html)
2. [`protected-inline-parity-contract.md`](./protected-inline-parity-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

