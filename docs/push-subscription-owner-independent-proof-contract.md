# Push Subscription Owner — Independent Proof Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-25
**Status:** `INDEPENDENT_PROOF_PREPARATION`; production extraction remains `BLOCKED`.

## Candidate boundary

The candidate is the bounded inline `async function subscribeToPushNotifications()` owner at `index.html:907–943`. It covers capability and account gates, service-worker readiness, existing/new subscription selection, VAPID key conversion handoff, subscription serialization, exact `push_subscriptions` upsert payload, and boolean failure handling.

The candidate excludes permission prompting, banner UI, silent-resubscribe scheduling, force unsubscribe/resubscribe, service-worker registration, PushManager implementation, VAPID conversion helper implementation, notification delivery, Settings adapter code, login/bootstrap, and all live behavior.

## Dependencies and side effects

The owner depends on `navigator.serviceWorker.ready`, `window.PushManager`, `ME.id`, `registration.pushManager.getSubscription()`, `registration.pushManager.subscribe(...)`, `subscription.toJSON()`, `urlBase64ToUint8Array`, `db.from('push_subscriptions').upsert(...).throwOnError()`, `navigator.userAgent`, and `Date`. The independent proof supplies detached mocks for every dependency. No real service worker, PushManager, permission request, database, storage, network, account, or browser effect is allowed.

## Exact parity boundary

The independent harness extracts the owner from current Branch2 and immutable `origin/main`, normalizes only line endings, and compares the exact owner body. The immutable-origin hash is pinned in `push-subscription-owner-independent-proof-rollback-evidence.txt`. Any owner-body difference fails parity.

## Detached proof matrix

The proof covers unsupported capability, missing user, existing subscription refresh, new subscription creation, subscribe failure, database upsert failure, exact VAPID conversion input, exact serialized payload, endpoint conflict policy, device-information truncation, and boolean return behavior. Before/after traces must match exactly.

| Gate | Required result |
|---|---|
| Capability gate | Unsupported browser returns `false` without service-worker or database access |
| Account gate | Missing user returns `false` without subscription or database access |
| Existing subscription | No new PushManager subscribe; exact DB upsert refreshes the record |
| New subscription | One subscribe call with `userVisibleOnly` and converted VAPID key |
| Payload | Exact user, endpoint, keys, truncated user agent, timestamp, and endpoint conflict policy |
| Failure recovery | Subscribe and database failures are caught and return `false` |
| Side-effect policy | All service-worker, PushManager, permission, database, storage, network, account, and browser effects are synthetic or zero |

## Authorization boundary

This contract authorizes detached independent proof only. It does not authorize production extraction, real PushManager operations, service-worker access, database persistence, permission prompts, or any real-account action. A future extraction requires new exact-scope production authorization, controlled non-production split, post-split parity, rollback-after-split, protected-accounting checks, and full Branch2 regression.

## Decision

`EXACT_ORIGIN_PARITY=REQUIRED`
`DETACHED_SYNTHETIC_PROOF=REQUIRED`
`ROLLBACK_ARTIFACT=REQUIRED`
`EXPLICIT_FEATURE_AUTHORIZATION=REQUIRED`
`PRODUCTION_DECISION=BLOCKED`
`PRODUCTION_CHANGE=0`
`LIVE_SIDE_EFFECTS=0`
`BROWSER_LIVE_ACTIONS=0`

## References

1. [`push-permission-resubscribe-protected-readiness-contract.md`](./push-permission-resubscribe-protected-readiness-contract.md)
2. [`push-permission-banner-owner-independent-proof-contract.md`](./push-permission-banner-owner-independent-proof-contract.md)
3. [`push-silent-resubscribe-owner-independent-proof-contract.md`](./push-silent-resubscribe-owner-independent-proof-contract.md)
4. [`high-risk-seam-readiness-matrix-contract.md`](./high-risk-seam-readiness-matrix-contract.md)
5. [`protected-inline-parity-contract.md`](./protected-inline-parity-contract.md)
6. [`push-subscription-owner-independent-proof-rollback-evidence.txt`](./push-subscription-owner-independent-proof-rollback-evidence.txt)
7. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
