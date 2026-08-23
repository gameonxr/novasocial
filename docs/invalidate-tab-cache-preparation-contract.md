**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Candidate:** `invalidateTabCache(tab)`  
**Scope:** Contained in-memory UI-cache invalidator; preparation only, with no production split yet.

## Candidate boundary

The owner deletes exactly one entry from the existing `_tabCache` object. It has eight existing callers in post/story/profile/chat-related refresh paths, but it performs no database, network, browser-storage, permission, messaging, upload, account, or navigation operation. The only dependency is the existing top-level `_tabCache` lexical binding.

The immutable normalized owner hash from `origin/main` is `19ccfb3a759fc68a9dddea3715cce4962b021ef60c423facc858a938d17bc127`. The candidate currently remains inline in `index.html`; no `src/features/invalidate-tab-cache-owner.js` exists.

## Preparation gates

| Gate | Status |
|---|---|
| Exact normalized origin parity | PASS |
| Caller boundary | PASS — eight existing callers |
| UI-only boundary | PASS — in-memory cache deletion only |
| Synthetic behavior seam | PASS — target and missing-entry branches |
| Detached browser proof | PASS — detached synthetic DOM only |
| Production split | Not started |
| Rollback evidence | Required before production split |

## Explicit exclusions

This preparation does not alter `_saveTabToCache`, `_tryRestoreFromCache`, `invalidateAllTabCache`, `goBack`, tab navigation, Reels persistence, account switching, admin systems, story/editor systems, messaging, calling, or any protected high-risk boundary. The candidate must be abandoned if the seam requires moving or modifying those owners.

## Evidence

The detached proof is recorded in [`invalidate-tab-cache-preparation-browser-proof-evidence.txt`](invalidate-tab-cache-preparation-browser-proof-evidence.txt).
