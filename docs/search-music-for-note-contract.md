# NovaSocial Search Music for Note Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the extracted note-music search controller.

## Contract

`searchMusicForNote(q)` clears the shared `_musicSearchDebounce`, obtains `#music-search-results`, and returns when the results element is absent. For an empty or whitespace-only query, it delegates to `renderRecentMusicSuggestions()` and returns without issuing a request.

For a non-empty query, it renders the searching state and schedules the existing delayed request. The delayed callback requests the iTunes song endpoint with `encodeURIComponent(q)`, parses JSON, renders the no-results state when needed, maps results to preview and selection handlers, and renders the existing failure state on exceptions.

The helper owns search orchestration and result markup only. Preview playback, music selection, recent persistence, and protected note attachment remain delegated to other modules. The current public iTunes endpoint, result limit, debounce delay, and failure text are documented rather than changed. No live request is performed by the audit harness.

## Harness coverage

`docs/search-music-for-note-contract-harness.js` validates debounce cleanup, results guard, empty-query fallback, request URL/encoding/limit, delayed callback, searching/no-results/failure states, result handler delegation, and non-ownership of playback or persistence.

The harness is static and deterministic. It does not contact iTunes or mutate the DOM.

## References

1. [`search-music-for-note.js`](../src/features/search-music-for-note.js)
2. [`render-recent-music-suggestions.js`](../src/features/render-recent-music-suggestions.js)
3. [`toggle-preview-play.js`](../src/features/toggle-preview-play.js)
4. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

