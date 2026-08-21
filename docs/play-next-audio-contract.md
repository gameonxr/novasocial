# NovaSocial Play Next Audio Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the extracted sequential audio helper.

## Contract

`playNextAudio(audioEl)` obtains all `audio` elements through `document.querySelectorAll('audio')`, iterates them in document order, and identifies the current element by reference equality. When the current element has a following audio element, it calls `.play()` on that next element and exits the loop.

When the supplied element is last, absent, or not present in the queried collection, the helper performs no playback. The helper owns sequential next-item playback only; audio markup, controls, persistence, and error handling remain outside the module.

The existing browser promise behavior of `.play()` is preserved and not speculatively altered by this audit.

## Harness coverage

`docs/play-next-audio-contract-harness.js` validates the function signature, audio-element query, ordered iteration, reference match, next-index guard, next-element playback, loop exit, and non-ownership of network or storage behavior.

The harness is static and deterministic. It does not create or play audio.

## References

1. [`play-next-audio.js`](../src/features/play-next-audio.js)
2. [`index.html`](../index.html), audio `onended` call sites
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

