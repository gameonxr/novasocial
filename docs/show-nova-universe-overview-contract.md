# NovaSocial Show Nova Universe Overview Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the pure Nova Universe overview response helper.

## Contract

`showNovaUniverseOverview()` is an async, side-effect-free response helper. It returns a stable overview string describing Nova Universe capabilities and the Profile navigation hint.

The response retains the named sections for Social Media, Messaging, Calls, AI Assistant, Notes, Calendar, Communities, Marketplace, Learning, News, and Games. Although the copy references protected product surfaces, the helper does not invoke or modify any DM, Reels, Calls, Stories, Notes, push, recording, diagnostics, or particle implementation.

The harness is static and documentation-only. It does not call the async helper or open any product surface.

## Harness coverage

`docs/show-nova-universe-overview-contract-harness.js` validates the async function signature, stable overview sections, navigation hint, and absence of side effects or delegated execution.

## References

1. [`show-nova-universe-overview.js`](../src/features/show-nova-universe-overview.js)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

