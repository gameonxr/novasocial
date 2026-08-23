# `invalidateTabCache(tab)` Production Split Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-23  
**Purpose:** Define and close the narrow, reversible production split for the contained in-memory UI-cache invalidator without moving cache ownership, navigation, persistence, account state, or protected systems.

## Production boundary

`invalidateTabCache(tab)` deletes exactly one entry from the existing top-level `_tabCache` object. The owner has exactly eight existing callers across the post, story, profile, and chat refresh paths. Its only dependency is the existing `_tabCache` lexical binding.

The production owner is preserved as an anonymous classic global assignment in [`src/features/invalidate-tab-cache-owner.js`](../src/features/invalidate-tab-cache-owner.js): `window.invalidateTabCache = function(tab) { delete _tabCache[tab]; };`. The existing callers remain unchanged. `_saveTabToCache`, `_tryRestoreFromCache`, `invalidateAllTabCache`, `goBack`, tab navigation, Reels persistence, account switching, admin systems, story/editor systems, messaging, calling, and all other protected boundaries remain outside this split.

## Completion gates

| Gate | Required evidence | Status |
|---|---|---|
| Exact owner parity | Normalized external owner matches immutable `origin/main`; SHA-256 `19ccfb3a…bc127` | PASS |
| Caller boundary | Eight existing cache-invalidation callers remain unchanged | PASS |
| UI-only boundary | In-memory `_tabCache` deletion only; no database, network, browser-storage, permission, account, messaging, upload, or navigation operation | PASS |
| Detached preparation proof | Target deletion and missing-entry no-op pass with zero side effects | PASS |
| Detached after-split proof | External owner loads once; target/missing behavior passes with zero side effects | PASS |
| Production split | Inline named owner removed; one external anonymous global owner linked in dependency order | PASS |
| Focused regression | Candidate, tab-cache, verification, admin, and high-risk contracts pass | PASS |
| First exhaustive regression | Clean pushed Branch2 gate passed at `f9fdb8fe49c186ab0f715137a3600303c099e4b` (`HARNESS_COUNT=271`) | PASS |
| Final documentation-tip regression | Clean pushed Branch2 gate passed at `fccb8907360b2de0142f9b88ead6c80e9ce46776` (`HARNESS_COUNT=272`) | PASS |

## Independent seam

The deterministic seam covers both supported cache branches: an existing target entry is removed, while an absent key is a safe no-op. The proof uses only an in-memory synthetic cache and detached local script evaluation. It does not load NovaSocial, a login session, live data, database services, network endpoints, browser storage, account controls, or stateful navigation.

## Rollback

The production split is reversible with `git revert 00cf7328b17cee2d2a48f2d8f3bd9343c9987ac8` on `Branch2`, followed by the focused candidate/protected checks and a clean exhaustive gate. Rollback restores the named inline owner and removes only the external owner linkage. It must preserve `_saveTabToCache`, `_tryRestoreFromCache`, `invalidateAllTabCache`, tab navigation, Reels persistence, account switching, admin systems, story/editor systems, messaging, calling, and every protected high-risk boundary.

## Evidence

1. [`invalidate-tab-cache-preparation-contract.md`](invalidate-tab-cache-preparation-contract.md)
2. [`invalidate-tab-cache-preparation-contract-harness.js`](invalidate-tab-cache-preparation-contract-harness.js)
3. [`invalidate-tab-cache-preparation-browser-proof-evidence.txt`](invalidate-tab-cache-preparation-browser-proof-evidence.txt)
4. [`invalidate-tab-cache-after-split-browser-proof-evidence.txt`](invalidate-tab-cache-after-split-browser-proof-evidence.txt)
5. [`invalidate-tab-cache-production-split-contract-harness.js`](invalidate-tab-cache-production-split-contract-harness.js)
6. [`invalidate-tab-cache-parity-rollback-evidence.txt`](invalidate-tab-cache-parity-rollback-evidence.txt)
7. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
