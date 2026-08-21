# NovaSocial FAB Long-Press Menu Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the extracted FAB long-press-menu positioning and close helpers.

## Contract

`showFabLongPressMenu()` locates `#fab-longpress-menu` and `#fab-main`, returning without mutation when either is absent. It displays the menu with the existing scale-in animation, initially positions it 200 pixels above the FAB, moves it below the FAB when the top would be less than 10 pixels, and clamps the horizontal position to keep a 180-pixel menu within a 190-pixel right margin.

`closeFabLongPressMenu()` locates the same menu and hides it when present. These helpers own only menu presentation and positioning; they do not create FAB actions, persist state, or modify protected systems.

The harness is static and documentation-only. It does not open or close the menu.

## Harness coverage

`docs/fab-longpress-menu-contract-harness.js` validates guard lookups, display and animation state, above/below placement, viewport clamping, left/top assignments, and close behavior.

## References

1. [`fab-longpress-menu.js`](../src/features/fab-longpress-menu.js)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

