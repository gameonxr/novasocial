# NovaSocial Home Hold Restore Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the extracted Home-tab long-press restore listener.

## Contract

`setupHomeHoldRestore()` installs document-level touch and mouse listeners. A press starts a two-second timer only when the event target is within `.nb[data-t="home"]`.

When the touch timer completes, it calls `restoreFabButton()` and then `haptic(20)`. When the mouse timer completes, it calls `restoreFabButton()` without haptic feedback. Touch release, touch movement, and mouse release clear the pending timer and reset it to `null`, preventing accidental restoration after an interrupted hold.

The helper installs listeners only; it does not render the Home page, own FAB state, or alter protected DM, Reels, Calls, Stories, Notes, push, recording, diagnostics, or particle systems.

The harness is static and documentation-only. It does not register browser listeners or trigger a long press.

## Harness coverage

`docs/setup-home-hold-restore-contract-harness.js` validates Home-target filtering, touch and mouse listener coverage, two-second timers, restore delegation, touch haptic behavior, and cancellation/reset behavior.

## References

1. [`setup-home-hold-restore.js`](../src/features/setup-home-hold-restore.js)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

