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

This is a **mapping-only checkpoint**. DMs rendering and realtime code remains inline. The existing deterministic DMs contract harness proves behavior, but it is not permission to extract production code. Before a split, the project still needs an explicit adapter seam, protected before/after marker parity, and reversible browser proof covering chat-open, background refresh, scroll retention, and navigation races.

The first implementation step must be test-only or adapter-only and must preserve the current `renderDMs()` and `_refreshDmsInPlace()` owners until the complete seam harness passes.

## Harness coverage

`docs/dms-seam-preparation-contract-harness.js` scans `index.html` and confirms the dependency/query/DOM/cache/scroll/navigation markers, the existing DMs behavior contract and harness, protected inline signatures, and zero matching protected signatures in `src/`. It does not query Supabase, open a chat, mutate messages, or move production code.

| Check | Expected behavior | Result |
|---|---:|---|
| Render owner | `renderDMs()` remains inline | PASS |
| Refresh owner | `_refreshDmsInPlace()` remains inline | PASS |
| Generation race | `_renderGeneration` checks remain | PASS |
| DOM preservation | `#screen`, `#notes-bar`, `scrollTop`, and `data-cid` markers remain | PASS |
| Data boundary | Conversations/unread/member query markers remain | PASS |
| Production split | None | PASS |

## References

1. [`dms-realtime-contract.md`](./dms-realtime-contract.md)
2. [`dms-realtime-contract-harness.js`](./dms-realtime-contract-harness.js)
3. [`high-risk-seam-readiness-matrix-contract.md`](./high-risk-seam-readiness-matrix-contract.md)
4. [`index.html`](../index.html)
5. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

