# NovaSocial Reels Seam-Preparation Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Prepare, but do not execute, a reversible seam for the protected Reels system.

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

This is a **mapping-only checkpoint**. Reels rendering, swipe handlers, persistent-container ownership, and video windowing remain inline. Two non-destructive browser-context mock artifacts now cover the empty state and query-error fallback. They prove reversible mock behavior only and are not permission to extract production code. Before a split, the project still needs an explicit adapter seam, protected before/after marker parity, and reversible browser proof for the production split itself, covering tab switching, saved-position restore, swipe settling, playback, and source release.

The first implementation step must be test-only or adapter-only and must preserve the current `renderReels()` and `_applyReelsVideoWindowing()` owners until the complete seam harness passes. The preparation harness also compares the exact two protected owner bodies with `origin/main`; any hash drift is a stop condition.

## Harness coverage

`docs/reels-seam-preparation-contract-harness.js` scans `index.html` and confirms persistent-container, saved-index, inner-transform, source-window, swipe, playback, and navigation markers, the existing Reels behavior contract and harness, the two passing non-destructive browser mock artifacts, protected inline signatures, and zero matching protected signatures in `src/`. It does not render Reels, open media, execute touch events, or move production code.

| Check | Expected behavior | Result |
|---|---:|---|
| Persistent container | Same live node is retained | PASS |
| Saved index | `_savedReelIndex` remains canonical | PASS |
| Video window | Current−1 through current+3 markers remain | PASS |
| Swipe settle | Dynamic count, easing, and `isSettling` remain | PASS |
| Playback | Windowing and resume hooks remain | PASS |
| Browser mock inventory | Empty-state and query-error fallback artifacts are present with PASS markers | PASS |
| Production split | None; both Reels owners remain inline | PASS |
| Exact owner no-drift comparison | Current protected owner bodies match `origin/main` | PASS |

## References

1. [`reels-persistent-contract.md`](./reels-persistent-contract.md)
2. [`reels-persistent-contract-harness.js`](./reels-persistent-contract-harness.js)
3. [`high-risk-seam-readiness-matrix-contract.md`](./high-risk-seam-readiness-matrix-contract.md)
4. [`index.html`](../index.html)
5. [`reels-empty-state-browser-proof-evidence.txt`](./reels-empty-state-browser-proof-evidence.txt)
6. [`reels-query-error-fallback-browser-proof-evidence.txt`](./reels-query-error-fallback-browser-proof-evidence.txt)
7. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

