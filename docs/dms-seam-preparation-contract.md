# NovaSocial DMs Seam-Preparation Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Prepare, but do not execute, a reversible seam for the protected DMs system.

## Preparation map

| Boundary | Current protected owner | Required seam input |
|---|---|---|
| Primary render | Inline `renderDMs()` and `_renderGeneration` | Render adapter preserving generation guard and fetched-result ordering |
| Background refresh | Inline `_refreshDmsInPlace()` / `_silentBackgroundRefresh()` | Non-destructive patch adapter; never replace `#screen` |
| Data | Inline Supabase queries for conversations, unread messages, other members, and Notes Bar | Data interface preserving parallel base fetch and dependent member fetch |
| Account/tab gate | Inline `ME`, current tab, chat-screen state | State adapter preserving early exits before queries |
| DOM | Inline `#screen`, `#notes-bar`, conversation `data-cid` rows, badges, timestamps, online indicators | DOM facade preserving node identity and targeted patch scope |
| Cache | Inline DMs cache read/write path | Cache adapter that saves only after successful active-DMs refresh |
| Scroll | Existing scroll container and `scrollTop` ownership | Scroll proof showing refresh does not reset position |
| Navigation race | Inline `_renderGeneration` checks after awaits | Generation adapter preserving abort-before-DOM/cache mutation |

## Gate status

This is a **mapping-only checkpoint**. DMs rendering and realtime code remains inline. Three non-destructive browser-context mock artifacts cover the empty state, no-account refresh guard, and current-tab refresh guard, while the realtime harness now exposes a test-only injected primary-render/in-place-refresh dispatcher. These artifacts prove reversible mock behavior only and are not permission to extract production code. Before a split, the project still needs protected before/after marker parity and reversible browser proof for the production boundary itself, covering chat-open, scroll retention, navigation races, and realtime behavior.

The first implementation step must be test-only or adapter-only and must preserve the current `renderDMs()` and `_refreshDmsInPlace()` owners until the complete seam harness passes.

## Harness coverage

`docs/dms-seam-preparation-contract-harness.js` scans `index.html` and confirms the dependency/query/DOM/cache/scroll/navigation markers, the existing DMs behavior contract and harness, the three passing non-destructive browser mock artifacts, the injected seam-proof marker, protected inline signatures, and zero matching protected signatures in `src/`. It does not query Supabase, open a chat, mutate messages, or move production code.

| Check | Expected behavior | Result |
|---|---:|---|
| Render owner | `renderDMs()` remains inline | PASS |
| Refresh owner | `_refreshDmsInPlace()` remains inline | PASS |
| Generation race | `_renderGeneration` checks remain | PASS |
| DOM preservation | `#screen`, `#notes-bar`, `scrollTop`, and `data-cid` markers remain | PASS |
| Data boundary | Conversations/unread/member query markers remain | PASS |
| Browser mock inventory | Empty-state, no-account guard, and current-tab guard artifacts are present with PASS markers | PASS |
| Injected seam proof | Primary-render and in-place-refresh dependencies dispatch explicitly in test-only mocks | PASS |
| Production split | None | PASS |

## References

1. [`dms-realtime-contract.md`](./dms-realtime-contract.md)
2. [`dms-realtime-contract-harness.js`](./dms-realtime-contract-harness.js)
3. [`high-risk-seam-readiness-matrix-contract.md`](./high-risk-seam-readiness-matrix-contract.md)
4. [`index.html`](../index.html)
5. [`dms-empty-state-browser-proof-evidence.txt`](./dms-empty-state-browser-proof-evidence.txt)
6. [`dms-refresh-no-account-browser-proof-evidence.txt`](./dms-refresh-no-account-browser-proof-evidence.txt)
7. [`dms-refresh-current-tab-browser-proof-evidence.txt`](./dms-refresh-current-tab-browser-proof-evidence.txt)
8. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

