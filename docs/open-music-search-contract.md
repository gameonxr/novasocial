# NovaSocial Open Music Search Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the extracted note-music search panel renderer.

## Contract

`openMusicSearch()` creates a `div` panel with class `se-panel`, id `music-search-panel`, fixed full-screen styling, and the existing Add Music layout. The generated markup must retain the close action that stops preview audio and removes the panel, the `music-search-inp` input with `searchMusicForNote(this.value)` input handling, and the `music-search-results` results container.

The helper appends the panel to `document.body`, obtains the search input, schedules guarded focus after the existing delay, installs a focus listener that scrolls the input into view after the existing delay, and delegates recent suggestions to `renderRecentMusicSuggestions()`.

The helper owns panel construction only. Music search requests, preview playback, recent-music persistence, and note attachment remain delegated to other modules or inline protected systems. Existing asynchronous focus timing and DOM assumptions are documented rather than changed.

## Harness coverage

`docs/open-music-search-contract-harness.js` validates panel construction markers, close/search handlers, DOM insertion, delayed focus and scrolling hooks, recent-suggestions delegation, and non-ownership of network or persistence behavior.

The harness is static and deterministic. It does not create browser DOM or issue music-search requests.

## References

1. [`open-music-search.js`](../src/features/open-music-search.js)
2. [`render-note-music-section.js`](../src/features/render-note-music-section.js)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

