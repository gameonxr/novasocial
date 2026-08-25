# Reels Renderer and Navigation — Independent Proof Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-25
**Status:** `INDEPENDENT_PROOF_COMPLETE`; production extraction remains `BLOCKED`.

## Candidate boundary

The candidate is the existing inline `renderReels()` owner in `index.html`, including the persistent-container restore branch, read-only reel query/fallback, empty-state renderer, media markup, progress updates, touch swipe lifecycle, playback pause/resume, windowing handoff, overlay wiring, and cleanup timers. The already-approved Reels video windowing helper is excluded from this proof and remains a separate owner. The surrounding `go()` and `goBack()` functions own tab transitions and navigation-stack mutation; this harness verifies that `renderReels()` does not mutate that stack or browser history.

## Exact origin parity

The independent harness extracts `renderReels()` from the current Branch2 `index.html` and immutable `origin/main:index.html`, normalizes only line endings, and compares the exact owner body. Any owner-body difference fails the proof. The normalized immutable-origin owner hash is `db1f15428a4452e72b4a5223a5050151cb5deea0092b3a858afbd012b09653ca`.

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

The temporary candidate is pinned by module SHA-256 `3b7985ad1d8163a186a757cdd65ca8db80f4fdb3a9054abfabbef8e5a0955a24`, synthetic after-HTML SHA-256 `16388e916adbcedbbadf0477b290e2b937fbceda1430cd4160639b8b02e62d5f`, and baseline HTML SHA-256 `a5179f6c626cae5936da608b268d5ac8e22965699a1f5d211cf5aa4d1c3890cc`. It exists only in `/tmp`; the production repository has no renderer linkage or owner relocation.

The proof records zero database writes, network calls, storage writes, account mutations, uploads, permission requests, live navigation, real media playback, and production changes. Synthetic `video.play()` calls are mocks and do not open or play real media.

## Rollback artifact

The rollback record pins the baseline commit, whole-file baseline hash, normalized owner hash, current inline owner location, synthetic experimental linkage/module hash, and exact restored hashes. The simulated rollback restores the complete pre-split HTML byte-for-byte. No production extraction is part of this checkpoint.

## Explicit authorization boundary

This checkpoint authorizes the independent proof gates listed above only. It does **not** authorize production extraction of the Reels renderer, swipe/navigation lifecycle, media playback, overlay actions, or cleanup. A future production decision still requires a separate formal authorization against this exact boundary, an actual controlled split, browser-safe post-split proof, and executed rollback-after-split evidence in a disposable non-production environment.

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
`BROWSER_SAFE_LIVE_ACTIONS=0`
`PRODUCTION_DECISION=BLOCKED`
`PRODUCTION_CHANGE=0`

This proof does not move source, change script order, alter protected accounting, modify schema, request media permissions, open live navigation, play real media, or mutate any production state.

## References

1. [`reels-renderer-navigation-protected-readiness-contract.md`](./reels-renderer-navigation-protected-readiness-contract.md)
2. [`high-risk-seam-readiness-matrix-contract.md`](./high-risk-seam-readiness-matrix-contract.md)
3. [`protected-inline-parity-contract.md`](./protected-inline-parity-contract.md)
4. [`reversible-browser-proof-contract.md`](./reversible-browser-proof-contract.md)
5. [`reels-renderer-navigation-independent-proof-rollback-evidence.txt`](./reels-renderer-navigation-independent-proof-rollback-evidence.txt)
6. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
