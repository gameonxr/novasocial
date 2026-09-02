# Push Subscription Owner — Dependency Map

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Status:** `PREPARATION_ONLY`; production extraction remains `BLOCKED`
**Candidate:** inline `async function subscribeToPushNotifications()`
**Current boundary:** `index.html:907–943` as recorded by the independent proof contract
**Proposed future module:** `src/features/push-subscription-owner.js`
**Proposed future global:** `window.subscribeToPushNotifications`
**Production authorization:** Not granted. This map does not authorize source mutation or live Push behavior.

## 1. Exact owner boundary

The bounded candidate begins at the existing inline `async function subscribeToPushNotifications()` declaration and ends at its matching closing brace. The owner covers capability detection, logged-in-user gating, service-worker readiness handoff, existing/new subscription selection, VAPID conversion handoff, subscription serialization, the `push_subscriptions` upsert payload, and boolean failure handling.

No other function may be moved under this candidate. The following neighboring surfaces remain outside the boundary: `maybeShowPushPermissionBanner()`, `silentPushResubscribeIfGranted()`, `forceResubscribePush()`, service-worker registration, the VAPID conversion helper implementation, notification delivery, Push settings UI, login/bootstrap, account transitions, and all callers.

## 2. Read dependencies

| Dependency | Use inside owner | Independent-proof substitute |
|---|---|---|
| `navigator.serviceWorker.ready` | Obtain the ready registration | Detached registration mock |
| `window.PushManager` | Capability gate | Synthetic presence/absence flag |
| `ME.id` | Identify current user | Synthetic logged-in/missing-user state |
| `registration.pushManager.getSubscription()` | Reuse or detect subscription | Existing/new/failure mock branches |
| `registration.pushManager.subscribe()` | Create a new subscription | Synthetic subscribe result/failure |
| `subscription.toJSON()` | Serialize endpoint and keys | Deterministic subscription JSON mock |
| `urlBase64ToUint8Array` | Convert configured VAPID key | Synthetic conversion spy/result |
| `db.from('push_subscriptions').upsert(...).throwOnError()` | Persist subscription record | Detached fluent database mock |
| `navigator.userAgent` | Device metadata in payload | Deterministic user-agent string |
| `Date` | Timestamp payload | Fixed synthetic clock |
| Existing VAPID configuration | Subscribe option input | Captured synthetic option value only |

The owner must retain the existing global names and lookup behavior. No dependency may be imported, renamed, reinitialized, or replaced as part of a production split.

## 3. Output and behavior contract

The capability gate must return `false` without service-worker, PushManager, or database access when the required browser capability is absent. The account gate must return `false` without subscription or persistence access when `ME` is missing or has no usable `id`.

For an existing subscription, the owner must not call `PushManager.subscribe()`; it must serialize the existing subscription and issue the exact current upsert payload. For a new subscription, it must call `subscribe()` exactly once with the existing `userVisibleOnly` and converted VAPID options, serialize the result, and issue the same exact upsert payload. Subscribe, serialization, and persistence failures must preserve the existing caught failure behavior and boolean result.

The exact payload fields, endpoint conflict policy, user-agent truncation, timestamp generation, and return values are governed by `push-subscription-owner-independent-proof-contract.md` and its harness. This map does not permit payload improvements or schema changes.

## 4. Timing and lifecycle

The owner is asynchronous and depends on the existing service-worker readiness promise. It must not introduce a second subscription flow, duplicate calls, timers, background work, or new cleanup behavior. It must preserve the current promise ordering: capability/account checks, service-worker readiness, existing/new subscription decision, optional subscribe, serialization, database upsert, success result, or caught failure result.

Permission prompting, service-worker registration, PushManager mutation, notification delivery, and subscription lifecycle ownership are explicitly outside this owner. The owner may only consume the existing readiness and helper contracts under synthetic proof.

## 5. Caller and script-order contract

Before any future extraction, inventory every caller of `subscribeToPushNotifications()` and confirm that callers resolve through the same global. The proposed module would be a classic script and would expose exactly `window.subscribeToPushNotifications`; it must not use `import`, `export`, `type="module"`, `defer`, or an altered asynchronous load strategy.

The module must load after the globals/helpers it reads and before any caller that may invoke it. Existing Push banner, silent-resubscribe, force-resubscribe, Settings, and initialization order must be preserved. No caller rewrite is in scope.

## 6. Synthetic proof and side-effect policy

The existing independent proof contract and harness are the current proof authority:

- `docs/push-subscription-owner-independent-authorization-addendum.md`
- `docs/push-subscription-owner-independent-proof-contract.md`
- `docs/push-subscription-owner-independent-proof-contract-harness.js`
- `docs/push-subscription-owner-independent-proof-rollback-evidence.txt`

The detached scenarios must cover unsupported browser, missing user, existing subscription refresh, new subscription creation, subscribe failure, database upsert failure, and get-subscription failure. They must assert exact VAPID input, serialized endpoint/key payload, endpoint conflict policy, user-agent truncation, timestamp/return behavior, and zero forbidden effects.

All service-worker, PushManager, permission, VAPID, database, storage, network, account, and browser behavior remains synthetic or zero during proof. No real Note, Push subscription, notification, login, account, or database action is permitted.

## 7. Production decision and next gate

`FEATURE_AUTHORIZATION=INDEPENDENT_PROOF_ONLY`
`PRODUCTION_DECISION=BLOCKED`
`PRODUCTION_CHANGE=0`
`LIVE_SIDE_EFFECTS=0`
`BROWSER_LIVE_ACTIONS=0`

The next safe action is to run the independent before-proof on the current clean Branch2 and record its result in `HANDOFF.md`. A future production extraction requires a new exact-scope production authorization addendum, explicit owner approval, guarded immutable-origin parity, controlled externalization, post-split lifecycle proof, disposable rollback, browser-safe observation, synchronized contracts, and a full clean Branch2 regression.

## References

1. [`push-subscription-owner-independent-authorization-addendum.md`](./push-subscription-owner-independent-authorization-addendum.md)
2. [`push-subscription-owner-independent-proof-contract.md`](./push-subscription-owner-independent-proof-contract.md)
3. [`push-subscription-owner-independent-proof-contract-harness.js`](./push-subscription-owner-independent-proof-contract-harness.js)
4. [`push-subscription-owner-independent-proof-rollback-evidence.txt`](./push-subscription-owner-independent-proof-rollback-evidence.txt)
5. [`push-permission-resubscribe-protected-readiness-contract.md`](./push-permission-resubscribe-protected-readiness-contract.md)
6. [`high-risk-seam-readiness-matrix-contract.md`](./high-risk-seam-readiness-matrix-contract.md)
7. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
8. [`HANDOFF.md`](../HANDOFF.md)
