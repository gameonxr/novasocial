# NovaSocial Smart Tab Cache Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-18
**Purpose:** Record the protected smart-tab-cache lexical-state and navigation invariants before any future refactor.

## Contract

The inline cache state consists of `_tabCache`, `_tabScrollPos`, and `TAB_CACHE_CONFIG`. Enabled non-Reels tabs may store an HTML snapshot and timestamp. `_saveTabToCache(tab)` always stores scroll position when a screen exists, but stores HTML only for configured cache-enabled tabs. Reels intentionally bypasses HTML snapshots because its persistent container owns video state.

When the DMs tab is showing an active chat screen, `_saveTabToCache('dms')` does not overwrite the last valid DMs list snapshot. This prevents chat DOM from being mistaken for the DMs-list cache. `_tryRestoreFromCache(tab)` rejects unknown, disabled, missing, and expired entries. Valid ordinary-tab entries restore HTML and display/overflow state immediately, then restore scroll position on a double `requestAnimationFrame` boundary. Targeted and global invalidation remove one or all cached entries.

The harness deliberately does not execute the protected Reels persistent-container branch or DM rendering functions; it validates only their cache-boundary invariants.

## Harness coverage

`docs/tab-cache-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Normal tab save | HTML snapshot and scroll position are stored | PASS |
| Normal tab restore | HTML, display, and overflow restore | PASS |
| Scroll restore | Double-rAF restores saved scroll position | PASS |
| Expiry | Stale cache is rejected | PASS |
| Unknown tab | No cache entry is created or restored | PASS |
| Active DMs chat | Chat DOM does not overwrite DMs cache | PASS |
| Reels | HTML cache is bypassed | PASS |
| Targeted invalidation | One tab cache is removed | PASS |
| Global invalidation | All tab caches are removed | PASS |

The harness uses mocked DOM, window state, date, and animation-frame boundaries only. It does not invoke real authentication, navigation, DMs rendering, Reels rendering, media playback, or account actions.

## Safe boundary

The protected cache helpers, navigation flow, DMs behavior, Reels persistent-container behavior, and lexical `_tabCache` state remain inline and unchanged. No production navigation or protected feature code was moved or rewritten in this checkpoint.

## Validation

The standalone harness passed. The complete repository validation chain must pass before this contract and harness are published to `docs/`.

## References

1. [`index.html` smart tab-cache implementation](../index.html)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
