# NovaSocial Reels Seam-Preparation Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the contained, reversible windowing-helper split for the protected Reels system while preserving the larger renderer as an inline owner.

## Preparation map

| Boundary | Current protected owner | Required seam input |
|---|---|---|
| Persistent DOM | Inline `#reels-persistent-container` and the Reels branch in `_tryRestoreFromCache()` | Container-ownership adapter preserving the same live node across tab switches |
| Position state | Inline `window._savedReelIndex` | State adapter preserving the canonical name and saved-index lifecycle |
| Inner transform | Inline `#rinner` and live child count | Transform facade using live count and zero-scroll/hidden-overflow restore |
| Video memory window | Inline `_applyReelsVideoWindowing()` | Media-window adapter preserving current−1 through current+3, `data-media-url`, and `load()` release |
| Swipe closure | Inline touch handlers and `isSettling` | Gesture adapter preserving force-complete, dynamic percentage, easing, and settle guard |
| Playback | Inline video lookup, pause/resume, and window reapplication | Playback seam with deterministic mocked media proof |
| Tab/navigation | Inline `go()` Reels leave/return branches | Navigation adapter preserving park/hide/reattach order |

## Gate status

The contained `_applyReelsVideoWindowing()` helper is now split to `src/features/reels-video-windowing.js` as one anonymous `window._applyReelsVideoWindowing` owner. The larger `renderReels()` renderer, swipe handlers, persistent-container ownership, playback, and navigation remain inline. Two non-destructive browser-context mock artifacts cover the empty state and query-error fallback, and the behavior harness exposes a test-only injected park/restore/window/settle/resume dispatcher. The helper passed exact origin/main parity, a pinned rollback target, and before/after read-only browser proof; this does not authorize extracting the remaining renderer.

The remaining `renderReels()` implementation must stay inline until its own independent gate passes. The completed windowing-helper move was allowed only after the exact helper body matched `origin/main`, the pinned rollback target was recorded, the read-only before/after browser proof passed, and the candidate harness passed. The harness continues to compare the inline renderer against `origin/main`; any hash drift is a stop condition.

## Harness coverage

`docs/reels-seam-preparation-contract-harness.js` scans `index.html` and confirms persistent-container, saved-index, inner-transform, source-window, swipe, playback, and navigation markers, the existing Reels behavior contract and harness, the two passing non-destructive browser mock artifacts, the injected seam-proof marker, protected inline signatures, and zero matching protected signatures in `src/`. It does not render Reels, open media, execute touch events, or move production code.

| Check | Expected behavior | Result |
|---|---:|---|
| Persistent container | Same live node is retained | PASS |
| Saved index | `_savedReelIndex` remains canonical | PASS |
| Video window | Current−1 through current+3 markers remain | PASS |
| Swipe settle | Dynamic count, easing, and `isSettling` remain | PASS |
| Playback | Windowing and resume hooks remain | PASS |
| Browser mock inventory | Empty-state and query-error fallback artifacts are present with PASS markers | PASS |
| Injected seam proof | Park, restore, window, settle, and resume dependencies dispatch explicitly in test-only mocks | PASS |
| Production split | `_applyReelsVideoWindowing()` split complete; `renderReels()` remains inline | PASS |
| Exact owner comparison | Extracted windowing helper matches `origin/main`; inline renderer remains no-drift | PASS |
| Before/after browser proof | Read-only shell, external-owner, persistent-container, and four-source window proof | PASS |
| Rollback evidence | Baseline commit and revert procedure pinned | PASS |

## References

1. [`reels-persistent-contract.md`](./reels-persistent-contract.md)
2. [`reels-persistent-contract-harness.js`](./reels-persistent-contract-harness.js)
3. [`high-risk-seam-readiness-matrix-contract.md`](./high-risk-seam-readiness-matrix-contract.md)
4. [`index.html`](../index.html)
5. [`reels-empty-state-browser-proof-evidence.txt`](./reels-empty-state-browser-proof-evidence.txt)
6. [`reels-query-error-fallback-browser-proof-evidence.txt`](./reels-query-error-fallback-browser-proof-evidence.txt)
7. [`reels-before-split-browser-proof-evidence.txt`](./reels-before-split-browser-proof-evidence.txt)
8. [`reels-after-split-browser-proof-evidence.txt`](./reels-after-split-browser-proof-evidence.txt)
9. [`reels-parity-rollback-evidence.txt`](./reels-parity-rollback-evidence.txt)
10. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

