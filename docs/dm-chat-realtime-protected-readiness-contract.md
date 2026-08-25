# Protected DMs, chat rendering, and realtime lifecycle — Protected Readiness Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-25
**Status:** `PREPARATION_ONLY`; production extraction remains `BLOCKED` until every gate below is independently approved.

## Scope and protected boundary

This dossier covers conversation discovery, chat rendering, message loading/sending, block policy, read/reply/action state, realtime subscriptions, and cache/navigation coupling. It is a system-level preparation artifact, not a duplicate one-owner extraction contract. Existing helper-level contracts remain authoritative for already-approved owners and are not weakened by this document.

## Dependency map

renderDMs/openChat/loadMsgs/sendMsg, conversation membership queries, messaging-block policy, message DOM, optimistic state, realtime subscriptions, unread state, cache, reply/forward actions, and media/upload references.

Protected source markers used by the detached inventory harness:
- `function renderDMs(`
- `function sendMsg(`

## Exact before/after parity boundary

Before/after must preserve conversation ordering, source/group exclusion, message rendering, composer state, block rejection, optimistic/realtime timing, unread/cache updates, action menus, and all caller/global names. No field, event, query, or cleanup may be silently dropped.

The parity comparison must use the immutable `origin/main` baseline and the Branch2 candidate snapshot. Any changed query, event, timer, global assignment, DOM mutation, storage key, media call, permission request, navigation transition, or cleanup sequence is a parity failure until explicitly authorized.

## Detached/browser-safe proof plan

Use detached VM/DOM mocks for empty/loading/error/success, block, group, realtime reconnect, stale chat, composer, reply, media, and rollback branches. Browser-safe proof may use a synthetic logged-out shell only; no login, send, upload, network, storage, or live navigation.

Required evidence is synthetic and detached. A mock result is not production approval. Browser-safe evidence must record the shell state, mocked dependencies, expected events, forbidden side effects, and cleanup result without using a real account or live mutation.

## Rollback artifact

Pin the pre-split index.html hash and owner hash; keep a revert commit that restores the inline owner and removes only the external linkage. Re-run DM, realtime, protected-parity, and full gates after rollback.

The rollback artifact must pin the pre-split commit, source owner hash, script insertion/removal boundary, and post-rollback gate results. No production extraction is eligible without this artifact.

## Explicit feature authorization

Explicit product authorization must name supported conversation types, payload/media semantics, block/privacy policy, realtime behavior, unread/cache behavior, error/rollback policy, and whether schema changes are allowed.

Authorization must be written against this exact system boundary. Authorization for a helper, control, or preparation harness does not authorize the protected system itself.

## Decision and non-goals

`EXACT_BEFORE_AFTER_PARITY=REQUIRED`
`DETACHED_BROWSER_SAFE_PROOF=REQUIRED`
`ROLLBACK_ARTIFACT=REQUIRED`
`EXPLICIT_FEATURE_AUTHORIZATION=REQUIRED`
`PRODUCTION_DECISION=BLOCKED`
`PRODUCTION_CHANGE=0`
`LIVE_SIDE_EFFECTS=0`
`BROWSER_LIVE_ACTIONS=0`

This dossier does not move code, change schema, authenticate, request permissions, upload media, send messages, mutate accounts, perform moderation, or alter protected accounting. It records what must be proven before a future minimal split can be considered.

## References

1. [`high-risk-seam-readiness-matrix-contract.md`](./high-risk-seam-readiness-matrix-contract.md)
2. [`protected-inline-parity-contract.md`](./protected-inline-parity-contract.md)
3. [`reversible-browser-proof-contract.md`](./reversible-browser-proof-contract.md)
4. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
