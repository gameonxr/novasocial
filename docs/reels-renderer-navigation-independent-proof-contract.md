# Reels Renderer and Navigation — Independent Proof Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-25
**Status:** `INDEPENDENT_PROOF_COMPLETE`; bounded production extraction is `SPLIT_VALIDATION_PENDING` until post-split browser and rollback gates pass.

## Candidate boundary

The candidate is the exact `renderReels()` owner now linked from `src/features/reels-renderer-owner.js`, including the persistent-container restore branch, read-only reel query/fallback, empty-state renderer, media markup, progress updates, touch swipe lifecycle, playback pause/resume, windowing handoff, overlay wiring, and cleanup timers. The already-approved Reels video windowing helper is excluded from this proof and remains a separate owner. The surrounding `go()` and `goBack()` functions own tab transitions and navigation-stack mutation; this harness verifies that `renderReels()` does not mutate that stack or browser history.

## Exact origin parity

The independent harness extracts `renderReels()` from immutable `origin/main:index.html` and compares it with the current Branch2 external owner module after normalizing only the classic-global wrapper and line endings. Any owner-body difference fails the proof. The normalized immutable-origin owner hash is `db1f15428a4452e72b4a5223a5050151cb5deea0092b3a858afbd012b09653ca`.

## Detached synthetic before/after proof

The harness executes both the immutable-origin owner and the current Branch2 owner only in detached synthetic DOM, database-read, video, timer, and navigation mocks. It compares their traces for persistent restore, empty read result, query failure, full swipe lifecycle, playback, overlay wiring, navigation-stack isolation, timing, cleanup, and a simulated split followed by exact rollback.

| Requested gate | Independent evidence | Result |
|---|---|---|
| Swipe | Fast forward swipe, cancelled short swipe, last-item edge, and backward swipe; active index, transform, thresholds, pause/play order, and 240ms settle transition match | PASS |
| Playback | Initial delayed play, active-video reset/play, all-video pause on transition, and progress-bar time update match | PASS |
| Navigation-stack | Renderer leaves a synthetic `navStack` unchanged and never calls `history.pushState`; stack ownership remains in `go()`/`goBack()` | PASS |
| Overlay | Exact double-tap, like, comments, share, create-reel, and profile wiring remains present in before/after rendered markup | PASS |
| Timing | Synthetic clock verifies 100ms first-play scheduling, 240ms transition, 290ms settle cleanup, and 20% progress update | PASS |
| Cleanup | Settled transition is cleared, no synthetic timers remain, and no forbidden DOM/media/network operation is invoked | PASS |
| Rollback-after-split | In-memory linkage-only split is reverted to byte-identical baseline HTML and owner hash | PASS |
| Non-production extraction candidate | One external classic linkage, inline owner removal, script order, candidate lifecycle parity, and no repository production change | PASS |
| Isolated post-split validation | Actual temporary tree with extracted module passed VM global exposure, exact lifecycle parity, and zero repository production changes | PASS |
| Isolated rollback | Temporary tree restored to exact Branch2 baseline; experimental linkage/module absent afterward | PASS |

The temporary candidate is pinned by module SHA-256 `3b7985ad1d8163a186a757cdd65ca8db80f4fdb3a9054abfabbef8e5a0955a24`, synthetic after-HTML SHA-256 `16388e916adbcedbbadf0477b290e2b937fbceda1430cd4160639b8b02e62d5f`, and baseline HTML SHA-256 `a5179f6c626cae5936da608b268d5ac8e22965699a1f5d211cf5aa4d1c3890cc`. The isolated candidate hashes are retained as historical evidence; the production Branch2 owner now uses the same classic linkage and exact owner body.

The proof records zero database writes, network calls, storage writes, account mutations, uploads, permission requests, live navigation, real media playback, and production changes. Synthetic `video.play()` calls are mocks and do not open or play real media.

## Rollback artifact

The rollback record pins the baseline commit, whole-file baseline hash, normalized owner hash, current inline owner location, synthetic experimental linkage/module hash, and exact restored hashes. The simulated rollback restores the complete pre-split HTML byte-for-byte. No production extraction is part of this checkpoint.

## Explicit authorization boundary

The exact-scope production authorization is recorded in `reels-renderer-navigation-production-authorization-addendum.md`. The split remains validation-pending until actual post-split browser-safe proof, executed rollback-after-split evidence, and clean full Branch2 regression pass; excluded navigation-stack, media-policy, action, upload, database, realtime, and account surfaces remain outside scope.

## Decision and non-goals

`EXACT_ORIGIN_PARITY=PASS`
`DETACHED_SYNTHETIC_PROOF=PASS`
`SWIPE_BEFORE_AFTER=PASS`
`PLAYBACK_BEFORE_AFTER=PASS`
`NAVIGATION_STACK_ISOLATION_BEFORE_AFTER=PASS`
`OVERLAY_WIRING_BEFORE_AFTER=PASS`
`TIMING_BEFORE_AFTER=PASS`
`CLEANUP_BEFORE_AFTER=PASS`
`ROLLBACK_AFTER_SPLIT_SIMULATION=PASS`
`NONPRODUCTION_EXTRACTION_CANDIDATE=PASS`
`CANDIDATE_LIFECYCLE_PARITY=PASS`
`ISOLATED_POST_SPLIT_VALIDATION=PASS`
`ISOLATED_ROLLBACK=PASS`
`BROWSER_SAFE_LIVE_ACTIONS=0`
`PRODUCTION_DECISION=SPLIT_VALIDATION_PENDING`
`PRODUCTION_CHANGE=1`

This proof and the bounded candidate do not alter excluded source, protected accounting, schema, permissions, live navigation, real media, or production state; the only Branch2 source change is the authorized renderer linkage and owner relocation.

## References

1. [`reels-renderer-navigation-protected-readiness-contract.md`](./reels-renderer-navigation-protected-readiness-contract.md)
2. [`high-risk-seam-readiness-matrix-contract.md`](./high-risk-seam-readiness-matrix-contract.md)
3. [`protected-inline-parity-contract.md`](./protected-inline-parity-contract.md)
4. [`reversible-browser-proof-contract.md`](./reversible-browser-proof-contract.md)
5. [`reels-renderer-navigation-independent-proof-rollback-evidence.txt`](./reels-renderer-navigation-independent-proof-rollback-evidence.txt)
6. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
