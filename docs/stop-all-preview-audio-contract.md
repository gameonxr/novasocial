# NovaSocial Stop All Preview Audio Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the structural invariants of the extracted preview-audio cleanup helper.

## Contract

`stopAllPreviewAudio()` checks the shared `_previewAudio` reference. When an audio object exists, it pauses that object and clears the shared reference. Regardless of whether audio exists, it resets `_previewPlayingIdx` to `null`.

The helper owns cleanup only. Audio construction, playback-state declaration, UI rendering, event binding, and media persistence remain outside this module. The existing guard and reset semantics are preserved without speculative bug fixes.

## Harness coverage

`docs/stop-all-preview-audio-contract-harness.js` validates the function signature, guarded pause, reference clearing, unconditional index reset, and non-ownership of audio creation or network behavior.

The harness is static and deterministic. It does not instantiate audio, play media, or mutate application state.

## References

1. [`stop-all-preview-audio.js`](../src/features/stop-all-preview-audio.js)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

