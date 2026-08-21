# NovaSocial FAB Speed Dial Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the extracted FAB speed-dial renderer and close helper.

## Contract

`toggleFabMenu()` locates `#fab-menu`, `#fab-icon`, and `#fab-main`, returning without mutation when the menu or FAB is absent. If the menu is already displayed as flex, it delegates to `closeFabMenu()`.

When opening, it renders five delegated entries: Post, Reel, Story, Live, and Drafts. It determines left/right orientation from the FAB midpoint, positions the menu above the FAB, sets display and scale-in animation, rotates the icon 45 degrees, and applies the open FAB background and blur. Entry actions close the menu before delegating to their existing owners.

`closeFabMenu()` hides the menu, resets icon rotation, and restores the default FAB background and no-blur state only when `fabStyle === 0`. The helper owns speed-dial presentation and positioning only; it does not move or implement the delegated post, Reels, Stories, Live, or scheduling systems.

The harness is static and documentation-only. It does not open the menu or trigger any delegated action.

## Harness coverage

`docs/fab-speed-dial-contract-harness.js` validates guard lookups, five menu items and delegates, side-aware orientation, positioning, display/animation state, icon rotation, close behavior, and presentation-only scope.

## References

1. [`fab-speed-dial.js`](../src/features/fab-speed-dial.js)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

