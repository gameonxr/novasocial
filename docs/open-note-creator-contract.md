# NovaSocial Open Note Creator Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the extracted note-composer UI renderer.

## Contract

`openNoteCreator()` creates the existing modal with `Edit Note` when `_myActiveNote` exists and `New Note` otherwise. It initializes `window._noteVisibility` from the active note with a followers fallback, initializes `window._noteMusic` from active-note music metadata or `null`, and initializes `window._noteTextDraft` from active-note text or an empty string.

The composer markup must retain the escaped text draft, 60-character textarea, character-count element, note-music section, visibility choices, submit delegation, and conditional remove-note delegation. The input listener updates the draft and character count, and the helper finishes by delegating to `renderNoteMusicSection()`.

The helper owns composer UI construction only. Note persistence, deletion, music selection, visibility state behavior, and modal implementation remain outside this module. Existing global state and HTML interpolation behavior are documented rather than changed.

## Harness coverage

`docs/open-note-creator-contract-harness.js` validates modal mode selection, note-state initialization, draft escaping, required composer IDs, visibility options, submit/delete handlers, input listener, character count, music-section delegation, and non-ownership of persistence/network behavior.

The harness is static and deterministic. It does not open a modal, mutate notes, or submit data.

## References

1. [`open-note-creator.js`](../src/features/open-note-creator.js)
2. [`render-note-music-section.js`](../src/features/render-note-music-section.js)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

