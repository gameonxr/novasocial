# NovaSocial Auto Play Note Music Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the extracted note-viewer music autoplay controller.

## Contract

`autoPlayNoteMusic(url, startSec)` pauses and clears any existing `_noteViewAudio`, creates a new `Audio(url)`, and sets `preload` to `auto`. Its internal `doPlay` callback attempts to set the current time to `startSec || 0`, starts playback with the existing autoplay-policy catch, and updates the note-music icon to the playing state.

If metadata is already available (`readyState >= 1`), `doPlay` executes immediately; otherwise it is registered for one `loadedmetadata` event. A `timeupdate` listener loops playback when the current time reaches the duration threshold, resetting to `startSec || 0` and attempting playback again.

The helper owns note-preview audio lifecycle only. Note loading, manual controls, persistence, and protected note rendering remain outside this module. Existing autoplay-policy catches and timing thresholds are documented rather than changed.

## Harness coverage

`docs/auto-play-note-music-contract-harness.js` validates previous-audio cleanup, audio creation/preload, start-offset assignment, guarded play, icon update, metadata branching, one-shot metadata registration, timeupdate loop threshold, and non-ownership of network or note persistence.

The harness is static and deterministic. It does not create audio or trigger autoplay.

## References

1. [`auto-play-note-music.js`](../src/features/auto-play-note-music.js)
2. [`toggle-note-music-manual.js`](../src/features/toggle-note-music-manual.js)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

