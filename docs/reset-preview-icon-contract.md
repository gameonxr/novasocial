# NovaSocial Reset Preview Icon Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the structural invariants of the extracted preview-icon reset helper.

## Contract

`resetPreviewIcon(idx)` resolves the indexed `#preview-icon-<idx>` element and, when present, replaces its contents with the standard SVG play polygon. Missing icons are ignored safely.

The helper owns icon rendering only. Audio playback, timing, selection state, and media controls remain outside this module and stay inline.

## Harness coverage

`docs/reset-preview-icon-contract-harness.js` validates indexed lookup, missing-element guard, exact play-polygon replacement, and renderer-only scope.

The harness is deterministic and static. It does not access DOM or audio playback state.

## Safe boundary

The extracted `src/features/reset-preview-icon.js` module remains unchanged in this checkpoint. Inline audio playback behavior remains untouched.

## References

1. [`reset-preview-icon.js`](../src/features/reset-preview-icon.js)
2. [`play-next-audio-contract.md`](./play-next-audio-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

