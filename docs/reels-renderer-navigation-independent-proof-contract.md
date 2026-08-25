# Reels Renderer and Navigation — Independent Proof Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-25
**Status:** `INDEPENDENT_PROOF_COMPLETE`; production extraction remains `BLOCKED`.

## Candidate boundary

The candidate is the existing inline `renderReels()` owner in `index.html`, including the persistent-container restore branch, read-only reel query/fallback, empty-state renderer, media markup, progress updates, touch swipe lifecycle, keyboard/navigation coupling, playback pause/resume, windowing handoff, overlay actions, and cleanup timers. The already-approved Reels video windowing helper is excluded from this proof and remains a separate owner.

## Exact origin parity

The independent harness extracts `renderReels()` from the current Branch2 `index.html` and immutable `origin/main:index.html`, normalizes only the declaration wrapper and line endings, and compares SHA-256 hashes. Any owner-body difference fails the proof. Current parity is pinned in `reels-renderer-navigation-independent-proof-rollback-evidence.txt`.

## Detached synthetic proof

The harness executes the unchanged owner only in detached synthetic DOM, database-read, video, timer, observer, and navigation mocks. It covers the persistent-container restore branch, empty read result, and read-query failure branch. It records the allowed DOM/read traces and asserts zero writes, uploads, permissions, account mutations, realtime broadcasts, live navigation, or media-device access. It does not authenticate, play real media, call a network, request a permission, or mutate a live account.

The proof is intentionally narrower than production approval. It proves the pinned owner and safe read/restore branches; it does not claim that the renderer, swipe navigation, playback, overlays, or cleanup lifecycle is safe to extract.

## Rollback artifact

The rollback record pins the baseline commit, normalized owner hash, current inline owner location, and a reversible procedure: restore the exact inline owner if a future experimental extraction is attempted, remove only its external linkage/module, and rerun this proof plus the full Branch2 gate. No production extraction is part of this checkpoint.

## Explicit authorization boundary

This checkpoint authorizes only the independent proof artifact. It does **not** authorize production extraction of the Reels renderer, swipe/navigation lifecycle, media playback, overlay actions, or cleanup. A future production decision still requires complete before/after parity, browser-safe proof, rollback-after-split evidence, and a dedicated feature authorization for this exact boundary.

## Decision and non-goals

`EXACT_ORIGIN_PARITY=PASS`
`DETACHED_SYNTHETIC_PROOF=PASS`
`BROWSER_SAFE_LIVE_ACTIONS=0`
`ROLLBACK_ARTIFACT=PINNED`
`EXPLICIT_FEATURE_AUTHORIZATION=REQUIRED_FOR_PRODUCTION`
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
