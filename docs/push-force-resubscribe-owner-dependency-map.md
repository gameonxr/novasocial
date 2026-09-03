# Force Resubscribe Push Owner — Dependency Map

**Repository:** `gameonxr/novasocial`
**Branch restriction:** `Branch2` only
**Status:** `PREPARATION_ONLY`; production extraction pending explicit authorization
**Candidate:** inline `async function forceResubscribePush()`
**Current boundary:** `index.html:924–957`
**Origin/main reference:** `index.html:2051–2087` (same owner body, SHA-256 `6f57c4e0fc347b63d158739a184e0f3f8323ed7c6b57528d0eb833aaaaa4d63d`)
**Proposed future module:** `src/features/push-force-resubscribe-owner.js`
**Proposed future global:** `window.forceResubscribePush`
**Production authorization:** Not yet granted. This map does not authorize source mutation or live Push behavior.

## 1. Exact owner boundary

The bounded candidate begins at the existing inline `async function forceResubscribePush()` declaration and ends at its matching closing brace. The owner covers capability detection, logged-in-user gating, service-worker readiness handoff, existing-subscription detection, browser-level unsubscribe, DB row deletion, fresh-subscribe handoff via `subscribeToPushNotifications()`, and boolean failure handling.

No other function may be moved under this candidate. The following neighboring surfaces remain outside the boundary: `maybeShowPushPermissionBanner()`, `silentPushResubscribeIfGranted()`, `subscribeToPushNotifications()` (already external), service-worker registration, VAPID constant, notification delivery, Push settings UI, login/bootstrap, account transitions, and all callers.

## 2. Read dependencies

| Dependency | Use inside owner | Independent-proof substitute |
|---|---|---|
| `navigator.serviceWorker.ready` | Obtain the ready registration | Detached registration mock |
| `window.PushManager` | Capability gate | Synthetic presence/absence flag |
| `ME.id` | Identify current user | Synthetic logged-in/missing-user state |
| `registration.pushManager.getSubscription()` | Detect existing subscription | Existing/none/failure mock branches |
| `existingSub.unsubscribe()` | Browser-level unsubscribe | Synthetic unsubscribe spy/failure |
| `db.from('push_subscriptions').delete().eq('endpoint', ...)` | Delete old DB row | Detached fluent database mock |
| `subscribeToPushNotifications()` | Fresh subscribe handoff (already external as `window.subscribeToPushNotifications`) | Synthetic function returning true/false/failure |
| `console.log/warn/error` | Logging | No-op console mock |

The owner must retain the existing global names and lookup behavior. No dependency may be imported, renamed, reinitialized, or replaced as part of a production split.

## 3. Output and behavior contract

The capability gate must return `false` without service-worker, PushManager, or database access when the required browser capability is absent. The account gate must return `false` without subscription or persistence access when `ME` is missing or has no usable `id`.

For an existing subscription, the owner must call `existingSub.unsubscribe()` exactly once, then delete the DB row matching the endpoint, then call `subscribeToPushNotifications()` for a fresh subscription. For no existing subscription, the owner must skip unsubscribe/DB-delete and proceed directly to `subscribeToPushNotifications()`.

Unsubscribe failure, DB delete failure, get-subscription failure, and fresh-subscribe failure must all be caught and return `false`. The owner must never throw.

## 4. Timing and lifecycle

The owner is asynchronous and depends on the existing service-worker readiness promise. It must not introduce a second subscription flow, duplicate calls, timers, background work, or new cleanup behavior. It must preserve the current promise ordering: capability/account checks, service-worker readiness, existing-subscription detection, optional unsubscribe, optional DB delete, fresh-subscribe handoff, success result, or caught failure result.

Permission prompting, service-worker registration, PushManager mutation beyond the existing-subscription unsubscribe, notification delivery, and subscription lifecycle ownership are explicitly outside this owner. The owner may only consume the existing readiness and helper contracts under synthetic proof.

## 5. Caller and script-order contract

Before any future extraction, inventory every caller of `forceResubscribePush()` and confirm that callers resolve through the same global. The proposed module would be a classic script and would expose exactly `window.forceResubscribePush`; it must not use `import`, `export`, `type="module"`, `defer`, or an altered asynchronous load strategy.

The module must load after `subscribeToPushNotifications` (already external at `src/features/push-subscription-owner.js`) and before any caller that may invoke it. Existing Push banner, silent-resubscribe, Settings, and initialization order must be preserved. No caller rewrite is in scope.

## 6. Synthetic proof and side-effect policy

The detached scenarios must cover:
- Unsupported browser (no serviceWorker or PushManager)
- Missing user (no ME.id)
- Existing subscription with successful unsubscribe + DB delete + fresh subscribe
- No existing subscription (skip to fresh subscribe)
- Unsubscribe failure
- DB delete failure
- Get-subscription failure
- Fresh-subscribe success (subscribeToPushNotifications returns true)
- Fresh-subscribe failure (subscribeToPushNotifications returns false)

All service-worker, PushManager, permission, VAPID, database, storage, network, account, and browser behavior remains synthetic or zero during proof. No real Push subscription, notification, login, account, or database action is permitted.

## 7. Production decision and next gate

```text
FEATURE_AUTHORIZATION=INDEPENDENT_PROOF_ONLY
PRODUCTION_DECISION=BLOCKED
PRODUCTION_CHANGE=0
LIVE_SIDE_EFFECTS=0
BROWSER_LIVE_ACTIONS=0
```

The next safe action is to run the independent before-proof on the current clean Branch2 and record its result in `HANDOFF.md`. A future production extraction requires a new exact-scope production authorization addendum, explicit owner approval, guarded immutable-origin parity, controlled externalization, post-split lifecycle proof, disposable rollback, browser-safe observation, synchronized contracts, and a full clean Branch2 regression.

## References

1. [`push-subscription-owner-dependency-map.md`](./push-subscription-owner-dependency-map.md) — sibling owner (already extracted)
2. [`push-subscription-owner-production-authorization-addendum.md`](./push-subscription-owner-production-authorization-addendum.md) — sibling authorization precedent
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
