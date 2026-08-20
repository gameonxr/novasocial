# NovaSocial Update Note Music Icon Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the structural invariants of the extracted note-viewer music icon renderer.

## Contract

`updateNoteMusicIcon(playing)` looks up `#note-music-play-icon` and returns without mutation when the element is absent. When present, it renders pause bars for a truthy `playing` value and the play polygon otherwise.

The helper owns icon markup only. Audio lifecycle, note state, playback controls, and persistence remain outside the module. Existing SVG geometry and DOM guard semantics are preserved.

## Harness coverage

`docs/update-note-music-icon-contract-harness.js` validates the function signature, indexed DOM lookup, missing-element guard, pause-bar branch, play-polygon branch, and non-ownership of audio/network behavior.

The harness is static and deterministic. It does not access a browser or play media.

## References

1. [`update-note-music-icon.js`](../src/features/update-note-music-icon.js)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

