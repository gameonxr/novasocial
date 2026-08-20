# NovaSocial Close Note Viewer Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the structural invariants of the extracted note-viewer cleanup helper.

## Contract

`closeNoteViewer()` pauses and clears `_noteViewAudio` when present. It resolves `#note-view-overlay`, applies a 0.2-second opacity transition, fades the overlay to zero, and schedules removal after 200 ms. Missing overlays are handled safely.

The helper owns viewer/audio cleanup only. Note loading, reactions, persistence, and audio playback remain outside this module.

## Harness coverage

`docs/close-note-viewer-contract-harness.js` validates guarded audio cleanup, overlay lookup, transition timing, fade-out state, delayed removal, and cleanup-only scope.

The harness is deterministic and static. It does not access audio, mutate DOM, or alter notes.

## Safe boundary

The extracted `src/features/close-note-viewer.js` module remains unchanged in this checkpoint. Protected note rendering, reactions, persistence, and audio systems remain untouched.

## References

1. [`close-note-viewer.js`](../src/features/close-note-viewer.js)
2. [`notes-contract.md`](./notes-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

