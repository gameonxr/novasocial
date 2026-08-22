# NovaSocial DMs Realtime Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-18
**Purpose:** Record the fragile DMs rendering and background-refresh invariants as a standalone contract before any future refactor.

## Contract

The primary DMs render fetches conversation membership data, unread-message data, and Notes Bar data in one `Promise.all` operation. The Notes Bar data is therefore available when the initial DMs DOM is constructed and is rendered from that already-fetched result. The dependent one-to-one `other-members` query remains sequential because it requires the conversation IDs obtained from the first fetch.

The background refresh path must not call `renderDMs()` and must not replace the main `#screen` container. `_refreshDmsInPlace()` performs a lightweight data refresh and patches the existing interface in place: it updates existing conversation names, timestamps, previews, unread badges, and online indicators; removes conversations that disappeared; prepends only new conversations; and refreshes the separate Notes Bar container. Because the main scrollable DOM node is retained, the current `scrollTop` is not reset and no destructive scroll-restoration race is introduced.

The refresh path exits before any query when there is no active account, the current tab is not DMs, or a chat screen is active. It also checks the current tab after the parallel base fetch and again after the dependent other-member fetch. If the user navigates away during either await sequence, the refresh returns without Notes Bar, conversation-list, or cache mutations.

The primary render captures `_renderGeneration` and refuses to overwrite the screen if navigation changes the generation during its await. The DMs background path similarly remains non-destructive and saves the DMs cache only after a successful in-place refresh while DMs is still active. The fast cache restore and the primary render entry semantics remain separate from the background patch path.

## Harness coverage

`docs/dms-realtime-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Primary DMs load | Conversations, unread counts, and Notes Bar fetch in parallel | PASS |
| Primary render ordering | Screen construction follows fetched data; Notes Bar uses that result | PASS |
| Active DMs refresh | Notes patch and targeted existing/remove/new item updates | PASS |
| Chat screen active | Skip before fetching | PASS |
| Wrong tab or logged-out state | Skip before fetching | PASS |
| Navigation during base fetch | Abort without DOM/cache patches | PASS |
| Navigation during other-member fetch | Abort without DOM/cache patches | PASS |
| Scroll state | `scrollTop` remains unchanged during refresh | PASS |
| Main screen replacement | Never occurs in background refresh | PASS |
| Injected seam dispatch | Primary render and in-place refresh owners dispatch explicitly; guard exits before fetching | PASS |

The harness is deterministic and uses mocked promises/events only. It does not invoke Supabase, DOM APIs, authentication, navigation, or real chat/message operations. Its injected seam dispatcher is test-only and is not loaded by `index.html`; production DMs owners remain inline.

## Safe boundary

The protected `renderDMs()`, `openChat()`, `_silentBackgroundRefresh()`, and related DMs realtime implementation remain inline and unchanged. The extracted `src/features/notes-bar.js` helper boundary remains intact. No production DMs code was moved or rewritten in this checkpoint.

## Validation

The standalone harness passed. The complete repository validation chain also passed, including all JavaScript syntax checks, HTML/script integration checks, every `/tmp/validate_*.py` contract validator, inline application-script syntax validation, whitespace checks, protected-function markers, script load order, Branch2 verification, and confirmation that `origin/main` remained unchanged.

## References

1. [`index.html` DMs implementation](../index.html)
2. [`notes-bar.js` extracted helper boundary](../src/features/notes-bar.js)
3. [`CRITICAL_CONTEXT.md`](../../upload/CRITICAL_CONTEXT.md)
4. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
