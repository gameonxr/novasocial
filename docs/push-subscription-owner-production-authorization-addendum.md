# Push Subscription Owner — Production Authorization Addendum

**Status:** Authorized by the project owner for bounded Branch2 extraction; production publication remains conditional on every post-split gate passing.
**Repository:** `gameonxr/novasocial`
**Branch restriction:** `Branch2` only
**Draft date:** 2026-09-02
**Current Branch2 baseline:** `5758519a334a58b02dc3337306856219b682328a`
**Immutable `origin/main`:** `ef418007c9b9a797488b4825be5f0c807da22369`

## Purpose and decision status

This addendum records the project owner’s explicit authorization for the bounded extraction described below. It does not authorize deployment publication or any live Push subscription, service-worker access, PushManager access, permission prompting, database persistence, network activity, account activity, or live browser action during validation.

The authorized scope is limited to moving the exact existing inline owner `async function subscribeToPushNotifications()` from `index.html` into one external classic-script module while preserving its current `window`-resolvable caller contract, function behavior, payload, script order, timing, and failure handling. Production publication remains conditional on every required post-split gate passing.

```text
FEATURE=Push subscription owner
OWNER=subscribeToPushNotifications()
PRODUCTION_DECISION=AUTHORIZED_EXTRACTION_CONDITIONAL_ON_ALL_GATES
PRODUCTION_CHANGE=0
LIVE_SIDE_EFFECTS=0
BROWSER_LIVE_ACTIONS=0
```

## Exact owner boundary

The current function owner begins at the declaration at `index.html:912` and ends at its matching closing brace at `index.html:943`. The immediately preceding VAPID constant, helper comment, and surrounding Push-phase comments are context and dependencies, not part of the owner body. The post-function comment and all neighboring functions are excluded.

| Item | Current contract |
|---|---|
| Inline owner | `async function subscribeToPushNotifications()` |
| Current function range | `index.html:912–943` |
| Existing global/caller resolution | Current classic-script global function resolution; preserve exact callable name and behavior |
| Proposed future module | `src/features/push-subscription-owner.js` |
| Proposed future global | `window.subscribeToPushNotifications` |
| Proposed linkage | One ordinary classic `<script src="src/features/push-subscription-owner.js"></script>` at the owner’s dependency-safe position |
| Origin parity reference | Normalized owner SHA-256 `b6f11d4f504f8bc4b3fb7bf47447e8169d093b283f08c6bedaa7bd353adf70b4` |

Only this one owner may move. No caller, helper, constant, service-worker handler, settings flow, or neighboring Push function may be rewritten under this authorization.

## Dependency and behavior contract

The owner reads the existing `navigator.serviceWorker.ready`, `window.PushManager`, `ME.id`, `registration.pushManager.getSubscription()`, `registration.pushManager.subscribe()`, `subscription.toJSON()`, `urlBase64ToUint8Array`, `db.from('push_subscriptions').upsert(...).throwOnError()`, `navigator.userAgent`, `Date`, and the existing VAPID public-key configuration. A future module must consume these contracts exactly as they exist; it must not import, rename, reinitialize, or replace them.

The capability gate must return `false` without service-worker, PushManager, or database access when support is absent. The logged-in-user gate must return `false` without subscription or persistence access when `ME?.id` is unavailable. An existing subscription must not trigger a new `PushManager.subscribe()` call. A new subscription must use the existing `userVisibleOnly: true` and converted VAPID application-server key. The serialized endpoint, keys, user ID, truncated user-agent, timestamp, endpoint conflict policy, success value, and caught failure value must remain exact.

## Explicit exclusions

This proposed authorization excludes all of the following surfaces and actions:

| Excluded surface/action | Requirement |
|---|---|
| Permission prompting | Never request or inspect a real permission during validation. |
| `maybeShowPushPermissionBanner()` | Separate completed owner; do not alter it. |
| `silentPushResubscribeIfGranted()` | Separate completed owner; do not alter it. |
| `forceResubscribePush()` | Remains inline/protected and outside scope. |
| Service-worker registration | Do not register, reload, or mutate a service worker. |
| Real `PushManager` | Do not call real `getSubscription()` or `subscribe()`. |
| VAPID helper implementation | Consume the existing helper only; do not extract or rewrite it. |
| Notification delivery | No notification send, receipt, or event handling. |
| Database persistence | Use detached mocks only; no real `push_subscriptions` write/upsert. |
| Storage/upload/network | No storage, upload, outbound side effect, or live network operation. |
| Settings UI | No settings interaction or UI rewrite. |
| Login/bootstrap/account | No login, account, authentication, or user-state mutation. |
| Service-worker `sw.js` behavior | No change to `sw.js` or Push event handlers. |
| Schema/policy/Edge Functions | No database schema, policy, or backend function change. |
| Real browser/account action | No login, click-through subscription, form submission, or real-account test. |

A passing proof for this owner does not authorize any excluded surface or any broader Push, service-worker, notification, account, or database system.

## Required gates before production publication

If explicit approval is later granted, the following gates are mandatory and all must pass:

1. **Baseline freeze:** verify `Branch2`, clean worktree, current baseline, remote alignment, and immutable `origin/main`.
2. **Guarded extraction:** compare the balanced owner body to immutable `origin/main`, assert exact parity, write one module and one linkage only, and abort before writing on mismatch.
3. **Classic-script preservation:** preserve `window.subscribeToPushNotifications`, callable behavior, script order, helper visibility, and no `import`, `export`, `type="module"`, or `defer` changes.
4. **Post-split parity:** run the production harness against the external owner and immutable-origin body.
5. **Synthetic lifecycle proof:** cover unsupported capability, missing user, existing subscription refresh, new subscription creation, VAPID/options, exact payload/conflict policy, subscribe failure, database failure, get-subscription failure, device-info truncation, and boolean results.
6. **Zero-live-effects proof:** assert no real permission, service-worker, PushManager, database, storage, network, account, authentication, or browser action.
7. **Rollback-after-split:** reverse only the module/linkage/owner change in a disposable directory and prove byte-for-byte restoration to the pre-split baseline.
8. **Protected-accounting synchronization:** update only exact inventory/marker contracts caused by this owner and preserve historical proof meaning.
9. **Safe browser observation:** verify only module HTTP response, login-safe boundary, global type, and non-invocation. Do not invoke the owner or perform live Push/database/account actions.
10. **Full regression and publication:** run every `docs/*harness.js`; require `TOTAL=319 PASSED=319 FAILED=0` or the measured current inventory after deliberate contract synchronization. Require clean Branch2, remote alignment, and immutable `origin/main`.
11. **Handoff update:** update `HANDOFF.md`, `MIGRATION_MAP.md`, readiness matrix, authorization state, evidence paths, commit, push, and next continuation action.

## Review and approval block

The text below is the recorded project-owner approval that authorizes the bounded extraction. It does not waive any required post-split gate or any exclusion.

```text
I explicitly authorize the bounded production extraction of
subscribeToPushNotifications() on Branch2 only, limited to the exact owner
boundary and exclusions in the Push subscription owner production authorization
addendum. Preserve the classic window behavior, script order, exact parity,
rollback, and all exclusions. Production publish requires every post-split gate
to pass. Do not perform live PushManager, service-worker, permission, VAPID,
subscription, database, storage, network, account, authentication, notification,
or real-browser actions during validation.
```

The exact authorization has now been received and recorded. The following conditional state remains binding until all post-split gates pass:

```text
EXPLICIT_FEATURE_AUTHORIZATION=RECEIVED
FEATURE_AUTHORIZATION=BOUNDED_PRODUCTION_EXTRACTION_AUTHORIZED
PRODUCTION_DECISION=AUTHORIZED_CONDITIONAL_ON_ALL_GATES
PRODUCTION_CHANGE=0
LIVE_SIDE_EFFECTS=0
BROWSER_LIVE_ACTIONS=0
```

## References

1. [`push-subscription-owner-dependency-map.md`](./push-subscription-owner-dependency-map.md)
2. [`push-subscription-owner-independent-authorization-addendum.md`](./push-subscription-owner-independent-authorization-addendum.md)
3. [`push-subscription-owner-independent-proof-contract.md`](./push-subscription-owner-independent-proof-contract.md)
4. [`push-subscription-owner-independent-proof-contract-harness.js`](./push-subscription-owner-independent-proof-contract-harness.js)
5. [`push-subscription-owner-independent-proof-rollback-evidence.txt`](./push-subscription-owner-independent-proof-rollback-evidence.txt)
6. [`push-permission-resubscribe-protected-readiness-contract.md`](./push-permission-resubscribe-protected-readiness-contract.md)
7. [`high-risk-seam-readiness-matrix-contract.md`](./high-risk-seam-readiness-matrix-contract.md)
8. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
9. [`HANDOFF.md`](../HANDOFF.md)
