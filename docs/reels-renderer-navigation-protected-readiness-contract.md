# Protected Reels renderer, swipe, and navigation lifecycle — Protected Readiness Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-25
**Status:** `PREPARATION_ONLY`; production extraction remains `BLOCKED` until every gate below is independently approved.

## Scope and protected boundary

This dossier covers main Reels rendering, swipe/keyboard navigation, media observation, windowing, navigation stack, action overlays, and playback cleanup. It is a system-level preparation artifact, not a duplicate one-owner extraction contract. Existing helper-level contracts remain authoritative for already-approved owners and are not weakened by this document.

## Dependency map

renderReels, active reel index, navigation stack, IntersectionObserver/video visibility, touch/pointer handlers, autoplay/pause policy, comments/likes/share actions, overlays, and cleanup timers.

Protected source markers used by the detached inventory harness:
- `function renderReels(`
- `navStack`

## Exact before/after parity boundary

Before/after must preserve item ordering, active index, swipe thresholds, keyboard behavior, observer timing, video play/pause, overlay dismissal, navigation stack transitions, and cleanup on every exit branch. The contained windowing helper remains separate and approved; the renderer is not approved.

The parity comparison must use the immutable `origin/main` baseline and the Branch2 candidate snapshot. Any changed query, event, timer, global assignment, DOM mutation, storage key, media call, permission request, navigation transition, or cleanup sequence is a parity failure until explicitly authorized.

## Detached/browser-safe proof plan

Use detached synthetic DOM/media/observer/timer mocks for first/middle/last item, fast swipes, cancelled gestures, missing media, visibility changes, overlay interaction, back navigation, and cleanup. Browser-safe proof must not open media devices or live navigation.

Required evidence is synthetic and detached. A mock result is not production approval. Browser-safe evidence must record the shell state, mocked dependencies, expected events, forbidden side effects, and cleanup result without using a real account or live mutation.

## Rollback artifact

Pin the renderer owner and index insertion boundary; rollback must restore the exact inline renderer and remove only the external linkage. Capture before/after screenshots or synthetic traces without logging in or mutating media.

The rollback artifact must pin the pre-split commit, source owner hash, script insertion/removal boundary, and post-rollback gate results. No production extraction is eligible without this artifact.

## Explicit feature authorization

Explicit authorization must define renderer ownership, navigation-stack contract, media autoplay policy, gesture thresholds, overlay/action ownership, cleanup guarantees, and an approved rollback window.

Authorization must be written against this exact system boundary. Authorization for a helper, control, or preparation harness does not authorize the protected system itself.

## Decision and non-goals

`EXACT_BEFORE_AFTER_PARITY=REQUIRED`
`DETACHED_BROWSER_SAFE_PROOF=REQUIRED`
`ROLLBACK_ARTIFACT=REQUIRED`
`EXPLICIT_FEATURE_AUTHORIZATION=REQUIRED`
`PRODUCTION_DECISION=BLOCKED`
`PRODUCTION_CHANGE=0`
`LIVE_SIDE_EFFECTS=0`
`BROWSER_LIVE_ACTIONS=0`

This dossier does not move code, change schema, authenticate, request permissions, upload media, send messages, mutate accounts, perform moderation, or alter protected accounting. It records what must be proven before a future minimal split can be considered.

## References

1. [`high-risk-seam-readiness-matrix-contract.md`](./high-risk-seam-readiness-matrix-contract.md)
2. [`protected-inline-parity-contract.md`](./protected-inline-parity-contract.md)
3. [`reversible-browser-proof-contract.md`](./reversible-browser-proof-contract.md)
4. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
