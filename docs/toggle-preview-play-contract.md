# NovaSocial Toggle Preview Play Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the structural invariants of the extracted note-music preview controller.

## Contract

`togglePreviewPlay(idx, url)` rejects a missing preview URL with the existing toast and returns without creating audio. For an already active, currently playing index, it pauses the shared preview audio, resets that preview icon, clears the active index, and returns.

For a new preview, it pauses any prior shared audio and resets its prior icon when an index exists, creates `new Audio(url)`, starts playback with failure feedback through the existing toast, records the active index, updates the current preview icon to pause bars, and installs an ended handler that resets the icon and clears the active index.

The helper owns preview interaction only. Shared state declarations, search rendering, audio persistence, and note attachment remain outside the module. Existing playback error behavior is documented rather than changed.

## Harness coverage

`docs/toggle-preview-play-contract-harness.js` validates the missing-preview guard, active-toggle branch, prior-preview cleanup, audio creation/playback, active-index assignment, pause-icon rendering, ended cleanup, and non-ownership of network behavior.

The harness is static and deterministic. It does not create audio or play media.

## References

1. [`toggle-preview-play.js`](../src/features/toggle-preview-play.js)
2. [`reset-preview-icon-contract.md`](./reset-preview-icon-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

