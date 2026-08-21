# NovaSocial FAB Customization Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the extracted FAB size and style customization helpers.

## Contract

`changeFabSize()` cycles `fabSize` through `[44, 52, 60, 68]`, applies the selected pixel width and height to `#fab-main` when present, persists `nova-fab-size`, emits the size toast, and closes the FAB long-press menu.

`changeFabStyle()` cycles `fabStyle` through three defined background and border presets, applies the selected background and border to `#fab-main` when present, uses a 16-pixel blur only for style index 1 and `none` otherwise, persists `nova-fab-style`, emits the style toast, and closes the FAB long-press menu.

Storage failures are caught. The helpers own customization presentation only and do not move or modify protected DM, Reels, Calls, Stories, Notes, push, recording, diagnostics, or particle systems.

The harness is static and documentation-only. It does not alter FAB styles, browser storage, or UI state.

## Harness coverage

`docs/fab-customization-contract-harness.js` validates size/style cycles, preset arrays, DOM assignments, storage keys, blur behavior, toast feedback, menu closure, and guarded storage access.

## References

1. [`fab-customization.js`](../src/features/fab-customization.js)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

