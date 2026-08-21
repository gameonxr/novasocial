# NovaSocial Toggle Note Music Manual Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the extracted note-viewer manual music toggle.

## Contract

`toggleNoteMusicManual(url, startSec)` checks the shared `_noteViewAudio` reference and its paused state. When audio exists and is currently playing, it pauses the audio, updates the note-music icon to the non-playing state, and returns.

When no active playback exists, it delegates to `autoPlayNoteMusic(url, startSec)`. The helper owns the manual branch decision only; audio creation, metadata handling, autoplay-policy behavior, looping, note loading, and persistence remain outside this module.

## Harness coverage

`docs/toggle-note-music-manual-contract-harness.js` validates the function signature, active-audio guard, pause behavior, icon reset, early return, inactive autoplay delegation, and non-ownership of audio creation or network behavior.

The harness is static and deterministic. It does not create or play audio.

## References

1. [`toggle-note-music-manual.js`](../src/features/toggle-note-music-manual.js)
2. [`auto-play-note-music.js`](../src/features/auto-play-note-music.js)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

