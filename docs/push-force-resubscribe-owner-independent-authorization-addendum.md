# Force Resubscribe Push Owner — Independent Authorization Addendum

**Repository:** `gameonxr/novasocial`
**Branch restriction:** `Branch2` only
**Date:** 2026-09-03
**Immutable `origin/main`:** `ef418007c9b9a797488b4825be5f0c807da22369`
**Status:** `INDEPENDENT_PROOF_ONLY` — production extraction remains `BLOCKED`

## Purpose

This addendum records the project owner's authorization for **independent proof only** of the bounded `forceResubscribePush()` owner. It does NOT authorize production extraction, source mutation, live Push subscription, service-worker access, PushManager access, permission prompting, database persistence, network activity, account activity, or live browser action.

The authorized scope is limited to creating a dependency map, an independent proof contract, and a detached synthetic harness that verifies the owner's behavior without live APIs.

## Decision

```text
FEATURE=Force resubscribe push owner
OWNER=forceResubscribePush()
PRODUCTION_DECISION=BLOCKED
INDEPENDENT_PROOF=AUTHORIZED
PRODUCTION_CHANGE=0
LIVE_SIDE_EFFECTS=0
BROWSER_LIVE_ACTIONS=0
```

## Exact owner boundary

| Item | Value |
|---|---|
| Inline owner | `async function forceResubscribePush()` |
| Current function range | `index.html:924–957` |
| Origin/main reference | `index.html:2051–2087` |
| Owner body SHA-256 | `6f57c4e0fc347b63d158739a184e0f3f8323ed7c6b57528d0eb833aaaaa4d63d` |
| Existing global/caller resolution | Classic-script global function resolution |
| Proposed future module | `src/features/push-force-resubscribe-owner.js` |
| Proposed future global | `window.forceResubscribePush` |

## Exclusions

This authorization does NOT permit:
- Movement of `subscribeToPushNotifications()` (already external), `maybeShowPushPermissionBanner()`, `silentPushResubscribeIfGranted()`, or any other Push function
- Service-worker registration, VAPID constant movement, or notification delivery
- Schema changes to `push_subscriptions` table
- Live Push subscription, permission prompting, or service-worker access during validation
- Caller rewrites, neighbor function modifications, or broad refactors
- Production extraction without a separate production authorization addendum

## Required proof scenarios

The independent proof harness must verify:
1. `UNSUPPORTED_GATE` — returns `false` when serviceWorker or PushManager is absent
2. `MISSING_USER_GATE` — returns `false` when `ME?.id` is unavailable
3. `EXISTING_SUBSCRIPTION_CYCLE` — existing sub → unsubscribe → DB delete → fresh subscribe
4. `NO_EXISTING_SUBSCRIPTION` — no existing sub → skip to fresh subscribe
5. `UNSUBSCRIBE_FAILURE` — unsubscribe throws → returns `false`
6. `DB_DELETE_FAILURE` — DB delete throws → returns `false`
7. `GET_SUBSCRIPTION_FAILURE` — getSubscription throws → returns `false`
8. `FRESH_SUBSCRIBE_SUCCESS` — subscribeToPushNotifications returns `true` → returns `true`
9. `FRESH_SUBSCRIBE_FAILURE` — subscribeToPushNotifications returns `false` → returns `false`

All scenarios must assert zero live effects (no real permission, SW, PushManager, DB, storage, network, or account access).

## Next gate

A separate `docs/push-force-resubscribe-owner-production-authorization-addendum.md` with `PRODUCTION_DECISION=AUTHORIZED_EXTRACTION_CONDITIONAL_ON_ALL_GATES` and explicit owner approval is required before any source extraction.
