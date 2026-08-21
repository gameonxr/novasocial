# NovaSocial Setup FAB Drag Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the extracted FAB drag, long-press, persistence, and restore wiring.

## Contract

`setupFabDrag()` locates `#fab-main` and exits when the element is absent or already initialized through `_fabSetup`. It tracks touch and mouse starts, movement, and ends through shared handlers.

A 600-millisecond hold opens `showFabLongPressMenu()` only when the pointer has not moved. Movement beyond five pixels cancels the long-press timer, closes both FAB menus, clamps the new position within the viewport using `fabSize`, and switches from right/bottom positioning to left/top positioning.

On drag end, the FAB snaps to the nearer horizontal edge, persists `nova-fab-pos`, temporarily clears the click handler to prevent an accidental click, and restores `toggleFabMenu` after 100 milliseconds. Initialization restores a valid saved position, hides the FAB when `nova-fab-hidden` is `true`, and delegates to `setupHomeHoldRestore()`.

The helper owns FAB interaction wiring only; it does not own protected DM, Reels, Calls, Stories, Notes, push, recording, diagnostics, or particle systems.

The harness is static and documentation-only. It does not register event listeners, move a FAB, access browser storage, or trigger menus.

## Harness coverage

`docs/setup-fab-drag-contract-harness.js` validates idempotence, shared pointer handlers, 600-millisecond long press, five-pixel movement threshold, menu cancellation, viewport clamping, edge snapping, position persistence, click restoration, saved-position restore, hidden-state handling, and Home-hold delegation.

## References

1. [`setup-fab-drag.js`](../src/features/setup-fab-drag.js)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

