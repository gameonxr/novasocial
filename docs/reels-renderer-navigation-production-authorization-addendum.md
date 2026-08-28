# Reels Renderer — Exact-Scope Production Authorization Addendum

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Authorization date:** 2026-08-28  
**Immutable `origin/main`:** `ef418007c9b9a797488b4825be5f0c807da22369`

## Authorization decision

The project owner explicitly authorized the bounded `async function renderReels()` extraction after the exact scope below was presented and confirmed with “ok continue”. This authorization covers controlled Branch2 preview validation and normal Branch2 publication only after every required gate passes.

| Authorized surface | Constraint |
|---|---|
| Candidate owner | Only the existing inline `async function renderReels()` body, from its persistent-container guard through its restore path |
| Global API | Preserve the classic-script global behavior as one anonymous `window.renderReels` owner |
| Parity | Preserve exact origin/main owner behavior, script order, DOM ownership, timing, swipe thresholds, playback order, overlay wiring, and cleanup |
| Validation | Detached proof, observation-only authenticated preview proof, reversible rollback-after-split proof, focused gates, and clean full Branch2 regression |
| Publication | Normal push to `origin/Branch2` only; never force-push or modify `main` |

## Explicit exclusions

This authorization does not permit changes to `_applyReelsVideoWindowing`, `go()`, `goBack()`, navigation-stack ownership, swipe/touch or keyboard semantics, media autoplay/pause policy, `IntersectionObserver` or visibility behavior, comments/likes/share/create-reel/profile action handlers, Notes coupling, creation/upload flows, database writes, realtime broadcasts, storage, account state, permissions, WebRTC, live media, production deployment, schema, or any other protected owner. It also does not authorize DMs/chat/realtime extraction.

Browser validation must remain observation-only: no messages, edits, deletes, reactions, calls, uploads, permission prompts, PushManager operations, service-worker changes, database writes, account changes, or intentional realtime mutations.

## Required completion decision

The feature is marked `SPLIT_COMPLETE` after exact before/after parity, detached/browser-safe proof, rollback-after-split evidence, focused Reels gates, clean full regression, and Branch2 remote alignment passed. If any gate fails, the extraction must stop and the reversible checkpoint must be restored.

`FEATURE_AUTHORIZATION=BOUNDED_RENDER_REELS_EXTRACTION`
`PRODUCTION_DECISION=SPLIT_COMPLETE`
`PRODUCTION_CHANGE=AUTHORIZED_ON_BRANCH2_ONLY`
`LIVE_SIDE_EFFECTS=0`
