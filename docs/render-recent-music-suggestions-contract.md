# NovaSocial Render Recent Music Suggestions Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the extracted recent note-music suggestions renderer.

## Contract

`renderRecentMusicSuggestions()` obtains `#music-search-results` and returns without mutation when the results element is absent. It reads `nova_recent_music` from `localStorage`, parses JSON with the existing empty-array fallback, and preserves the existing catch behavior for malformed storage data.

When no recents exist, it renders the existing search guidance message. When recents exist, it renders the RECENTLY USED header and maps each song to selection markup carrying title, artist, artwork fallback, and preview URL fallback through `selectNoteMusicResult(...)`.

The helper owns recent-suggestions rendering only. Recent persistence, music search requests, preview playback, and note attachment remain delegated to other modules. Existing local-storage parsing behavior and markup interpolation are documented rather than changed.

## Harness coverage

`docs/render-recent-music-suggestions-contract-harness.js` validates the guarded results lookup, local-storage key and JSON fallback, empty-state message, recent header, song mapping, selection handler, artwork/preview fallbacks, and non-ownership of network or persistence writes.

The harness is static and deterministic. It does not access browser storage or mutate the DOM.

## References

1. [`render-recent-music-suggestions.js`](../src/features/render-recent-music-suggestions.js)
2. [`save-recent-music.js`](../src/features/save-recent-music.js)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

