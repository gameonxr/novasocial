# Force Resubscribe Push Owner — Production Authorization Addendum

**Status:** Authorized by the project owner for bounded Branch2 extraction; production publication remains conditional on every post-split gate passing.
**Repository:** `gameonxr/novasocial`
**Branch restriction:** `Branch2` only
**Authorization date:** 2026-09-03
**Current Branch2 baseline:** `15285f3d1a5b7a426fb0607c1b192dcd3152a616`
**Immutable `origin/main`:** `ef418007c9b9a797488b4825be5f0c807da22369`

## Purpose and decision status

This addendum records the project owner's explicit authorization for the bounded extraction described below. It does not authorize deployment publication or any live Push subscription, service-worker access, PushManager access, permission prompting, database persistence, network activity, account activity, or live browser action during validation.

The authorized scope is limited to moving the exact existing inline owner `async function forceResubscribePush()` from `index.html` into one external classic-script module while preserving its current `window`-resolvable caller contract, function behavior, payload, script order, timing, and failure handling. Production publication remains conditional on every required post-split gate passing.

```text
FEATURE=Force resubscribe push owner
OWNER=forceResubscribePush()
PRODUCTION_DECISION=AUTHORIZED_EXTRACTION_CONDITIONAL_ON_ALL_GATES
PRODUCTION_CHANGE=0
LIVE_SIDE_EFFECTS=0
BROWSER_LIVE_ACTIONS=0
```

## Exact owner boundary

The current function owner begins at the declaration at `index.html:924` and ends at its matching closing brace at `index.html:957`. The immediately preceding JSDoc comment and surrounding Push-phase comments are context and dependencies, not part of the owner body. The post-function comment and all neighboring functions are excluded.

| Item | Current contract |
|---|---|
| Inline owner | `async function forceResubscribePush()` |
| Current function range | `index.html:924–957` |
| Origin/main reference | `index.html:2051–2087` |
| Existing global/caller resolution | Current classic-script global function resolution; preserve exact callable name and behavior |
| Proposed future module | `src/features/push-force-resubscribe-owner.js` |
| Proposed future global | `window.forceResubscribePush` |
| Proposed linkage | One ordinary classic `<script src="src/features/push-force-resubscribe-owner.js"></script>` at the owner's dependency-safe position |
| Origin parity reference | Normalized owner SHA-256 `6f57c4e0fc347b63d158739a184e0f3f8323ed7c6b57528d0eb833aaaaa4d63d` |

Only this one owner may move. No caller, helper, constant, service-worker handler, settings flow, or neighboring Push function may be rewritten under this authorization.

## Dependency and behavior contract

The owner reads the existing `navigator.serviceWorker.ready`, `window.PushManager`, `ME.id`, `registration.pushManager.getSubscription()`, `existingSub.unsubscribe()`, `db.from('push_subscriptions').delete().eq('endpoint', ...)`, `subscribeToPushNotifications()` (already external as `window.subscribeToPushNotifications`), `console.log/warn/error`, and the existing VAPID public-key configuration (consumed indirectly via `subscribeToPushNotifications`). A future module must consume these contracts exactly as they exist; it must not import, rename, reinitialize, or replace them.

The capability gate must return `false` without service-worker, PushManager, or database access when support is absent. The logged-in-user gate must return `false` without subscription or persistence access when `ME?.id` is unavailable. An existing subscription must trigger exactly one `unsubscribe()` call, one DB delete by endpoint, and one `subscribeToPushNotifications()` call. No existing subscription must skip directly to `subscribeToPushNotifications()`. Unsubscribe failure, DB delete failure, get-subscription failure, and fresh-subscribe failure must all preserve the existing caught failure behavior and boolean result.

## Explicit exclusions

This proposed authorization excludes all of the following surfaces and actions:

- Movement of `subscribeToPushNotifications()` (already external), `maybeShowPushPermissionBanner()`, `silentPushResubscribeIfGranted()`, or any other Push function
- Service-worker registration, VAPID constant movement, or notification delivery
- Schema changes to `push_subscriptions` table
- Live Push subscription, permission prompting, service-worker access, PushManager mutation, or database writes during validation
- Caller rewrites, neighbor function modifications, or broad refactors
- Conversion to ES modules, `import`/`export`, `type="module"`, `defer`, or asynchronous loading
- Any change to `origin/main` or any branch other than `Branch2`

## Required post-split gates

1. Production split contract (`docs/push-force-resubscribe-owner-production-split-contract.md`)
2. Production split harness (`docs/push-force-resubscribe-owner-production-split-contract-harness.js`)
3. Exact origin/main parity (byte-for-byte owner body)
4. Synthetic proof (9 scenarios identical to independent proof)
5. Disposable rollback evidence
6. Static browser observation (script tags balanced, dependency order preserved)
7. Full clean Branch2 regression (all harnesses pass)
8. Branch2 remote alignment + immutable `origin/main` verification
