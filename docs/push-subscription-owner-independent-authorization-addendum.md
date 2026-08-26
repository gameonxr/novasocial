# Push Subscription Owner — Scoped Authorization Addendum

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Authorization date:** 2026-08-25
**Baseline commit:** `ab5aa9f71666a67b8fcf55888b9a0efb704d92a4`
**Immutable `origin/main`:** `ef418007c9b9a797488b4825be5f0c807da22369`

## Authorization decision

This addendum grants explicit scoped authorization to complete detached independent proof for the bounded inline `async function subscribeToPushNotifications()` owner only. It does not authorize production extraction, live service-worker access, real PushManager operations, database persistence, permission prompts, or real-account activity.

| Gate | Decision |
|---|---|
| Candidate | Inline `async function subscribeToPushNotifications()`, `index.html:907–943` |
| Exact origin parity | PASS; normalized owner SHA-256 `b6f11d4f504f8bc4b3fb7bf47447e8169d093b283f08c6bedaa7bd353adf70b4` |
| Detached proof | PASS; unsupported, missing-user, existing/new subscription, VAPID, payload, and failure branches |
| Push behavior | Synthetic service-worker and PushManager mocks only |
| Persistence behavior | Synthetic `push_subscriptions` upsert mock only |
| Production extraction | NOT AUTHORIZED |
| Protected accounting | Unchanged: 19 signatures, 9 approved extracted owners, 10 blocked systems |

## Allowed proof surface

The proof may execute the exact unchanged owner with synthetic `navigator.serviceWorker.ready`, `window.PushManager`, `ME.id`, `getSubscription`, `subscribe`, `toJSON`, `urlBase64ToUint8Array`, `db.from('push_subscriptions').upsert(...).throwOnError()`, `navigator.userAgent`, `Date`, and console mocks. It may record exact new-subscription options, VAPID input, serialized endpoint/key payload, endpoint conflict policy, user-agent truncation, and boolean return values.

The authorized scenarios are unsupported browser, missing logged-in user, existing subscription refresh, new subscription creation, subscription failure, database upsert failure, and get-subscription failure. All service-worker, PushManager, and database behavior must remain synthetic.

## Explicit exclusions

This authorization excludes permission prompting, `maybeShowPushPermissionBanner()`, `silentPushResubscribeIfGranted()`, `forceResubscribePush()`, service-worker registration, real PushManager subscription, VAPID helper extraction, notification delivery, Settings UI, login/bootstrap, account mutation, storage, network, and all live browser or real-account actions. A proof pass is not permission to split any excluded surface.

## Production re-review requirement

A future production request requires a new exact-scope production authorization, controlled non-production split, post-split parity and lifecycle proof, rollback-after-split, protected-accounting checks, and a clean full Branch2 regression. Until then:

`FEATURE_AUTHORIZATION=INDEPENDENT_PROOF_ONLY`

`PRODUCTION_DECISION=BLOCKED`

`PRODUCTION_CHANGE=0`

`LIVE_SIDE_EFFECTS=0`
