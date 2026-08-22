# NovaSocial Reels Persistent-Container Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-18
**Purpose:** Record the fragile Reels persistence and swipe invariants as a standalone contract before any future refactor.

## Contract

Reels does not use the generic HTML snapshot cache. Its `#reels-persistent-container` is a live DOM node that must survive tab switches so video state, current position, and swipe closures remain valid. When leaving Reels, the same container is moved to `document.body`, hidden, and not destroyed. The screen overflow is restored to normal scrolling, and the current position is saved in `window._savedReelIndex`.

When returning to Reels, the persistent container is reattached to `#screen` and made visible rather than rebuilt. The screen is set to `overflow: hidden` with `scrollTop: 0` so native scrolling cannot compete with the `#rinner` CSS transform. The saved index is restored using a transition-disabled transform based on the live number of reel slides; the transition is re-enabled on the next animation frame. The correct video is resumed and Reels video windowing is reapplied.

The video windowing helper loads sources only for the current reel through three reels after it, plus one reel before it (`currentIndex - 1` through `currentIndex + 3`). Missing sources inside that window are restored from `data-media-url`. Sources outside the window are removed and `load()` is called to release decoded media. Videos without a stored media URL are left untouched.

Swipe handlers calculate the reel percentage dynamically from the live `#rinner` child count. A new touch force-completes an in-flight settle animation before applying drag movement. Snap/settle uses the existing `0.24s cubic-bezier(0.22, 1, 0.36, 1)` transition, marks `isSettling` during the animation, and clears the settle state after the existing safety delay. The canonical saved-index name is `window._savedReelIndex`; the obsolete `_savedReelIdx` spelling must not be reintroduced.

## Harness coverage

`docs/reels-persistent-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Leaving Reels | Park and hide the same container; restore screen scrolling; save index | PASS |
| Returning to Reels | Reattach existing container; show it; enforce hidden overflow and zero scroll | PASS |
| Position restore | Disable transition, restore transform from saved index/live count, re-enable next frame | PASS |
| Source window | Keep/load current−1 through current+3 sources | PASS |
| Memory release | Remove sources and call `load()` outside the window | PASS |
| Fallback video | Leave videos without `data-media-url` unchanged | PASS |
| Dynamic swipe math | Use live reel count for percentage | PASS |
| Overlapping swipe | Force-complete prior settle before new drag | PASS |
| Settle animation | Preserve duration/easing and in-flight settle state | PASS |
| Injected seam dispatch | Park, restore, window, settle, and resume dependencies dispatch in explicit order | PASS |

The harness is deterministic and uses mocked objects/events only. It does not invoke real DOM, video, browser animation, media playback, authentication, or navigation behavior. Its injected seam dispatcher is test-only: it demonstrates dependency ownership and ordering without being loaded by `index.html` or assigning any runtime `window` owner.

## Safe boundary

The protected `renderReels()`, `_tryRestoreFromCache()` Reels branch, `_applyReelsVideoWindowing()`, and touch handler closure remain inline and unchanged. No Reels production code was moved or rewritten in this checkpoint.

## Validation

The corrected standalone harness passed. The complete repository validation chain also passed, including all JavaScript syntax checks, HTML/script integration checks, every `/tmp/validate_*.py` contract validator, inline application-script syntax validation, whitespace checks, protected-function markers, script load order, Branch2 verification, and confirmation that `origin/main` remained unchanged.

## References

1. [`index.html` Reels implementation](../index.html)
2. [`CRITICAL_CONTEXT.md`](../../upload/CRITICAL_CONTEXT.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
