# NovaSocial Save Recent Music Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the extracted recent note-music local-storage helper.

## Contract

`saveRecentMusic(title, artist, artwork, previewUrl)` reads `nova_recent_music` from `localStorage` and falls back to an empty array when absent. It removes an existing entry matching both title and artist, prepends the new song object, limits the collection to eight entries, and writes the JSON result back to the same storage key.

The entire operation remains guarded by the existing `try/catch`; storage or JSON failures are swallowed as before. The helper owns local recent persistence only. Rendering, search requests, playback, and note attachment remain outside this module.

The existing call sites preserve a pre-existing asymmetry: one safe caller supplies no preview URL while segment confirmation supplies it. This audit documents that behavior and does not change it.

## Harness coverage

`docs/save-recent-music-contract-harness.js` validates the function signature, storage key, JSON fallback, duplicate identity filter, newest-first insertion, eight-entry cap, persisted payload, silent catch, and non-ownership of network behavior.

The harness is static and deterministic. It does not access browser storage or mutate user data.

## References

1. [`save-recent-music.js`](../src/features/save-recent-music.js)
2. [`render-recent-music-suggestions.js`](../src/features/render-recent-music-suggestions.js)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

