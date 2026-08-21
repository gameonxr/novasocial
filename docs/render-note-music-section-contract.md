# NovaSocial Render Note Music Section Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the extracted note-music section renderer.

## Contract

`renderNoteMusicSection()` obtains `#note-music-section` and returns without mutation when the section is absent. When `window._noteMusic` exists, it renders the selected artwork fallback, title, artist, and a clear action that resets `window._noteMusic` and rerenders the section.

When no music is selected, it renders the Add a song empty state and delegates opening the search panel to `openMusicSearch()`. The helper owns section markup only; music selection, search, audio playback, persistence, and note submission remain outside this module.

Existing HTML interpolation and global-state semantics are documented rather than changed. The artwork URL and metadata are rendered exactly as the existing implementation provides them.

## Harness coverage

`docs/render-note-music-section-contract-harness.js` validates the guarded section lookup, selected-state branch, artwork fallback, title/artist rendering, clear action, empty-state branch, search delegation, and non-ownership of network or persistence behavior.

The harness is static and deterministic. It does not create browser DOM or mutate note state.

## References

1. [`render-note-music-section.js`](../src/features/render-note-music-section.js)
2. [`open-music-search.js`](../src/features/open-music-search.js)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

