# Push Permission Banner Owner — Production Authorization Addendum

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Authorization date:** 2026-08-28
**Baseline commit:** `4b6c301cda56c60d279f43a6d6848029a88cd7d3`
**Immutable `origin/main`:** `ef418007c9b9a797488b4825be5f0c807da22369`

## Explicit authorization

The project owner explicitly authorizes the bounded production extraction of `maybeShowPushPermissionBanner()` on Branch2 only, limited to the exact owner boundary and exclusions in this addendum. The extraction must preserve classic `window` behavior, script order, exact parity, rollback, and all exclusions. Production publication requires every post-split gate to pass. Validation must not perform live permission, service-worker, PushManager, database, or account actions.

## Exact authorized boundary

The authorized owner is the inline `function maybeShowPushPermissionBanner()` at `index.html:1005–1061` on the baseline. It includes support and permission gates, account-scoped dismissal lookup, delayed banner creation, logged-out cleanup, existing-banner protection, synthetic enable/dismiss handlers, and banner removal. The external owner must be exposed as `window.maybeShowPushPermissionBanner` through a classic script.

## Explicit exclusions

This authorization does not include `subscribeToPushNotifications()`, `forceResubscribePush()`, service-worker registration or access, PushManager subscription or unsubscribe, VAPID conversion, database persistence, notification delivery, Settings adapter changes, login/bootstrap, account mutation, storage outside the existing dismissal flag, or any unrelated Push or account behavior. Browser validation must remain observation-only and must not invoke the banner’s Enable or Dismiss actions.

## Required gates

The split must pass exact immutable-origin body parity, one-owner/one-linkage accounting, dependency and script-order checks, detached success/error/timing/cleanup proof, safe non-mutating browser observation, reversible apply-and-rollback proof, protected accounting, and the complete clean Branch2 regression. Any mismatch requires stopping and reverting the checkpoint.

## Authorization markers

`FEATURE_AUTHORIZATION=BOUNDED_PRODUCTION_EXTRACTION`

`PRODUCTION_DECISION=AUTHORIZED_FOR_BOUNDED_OWNER_ONLY`

`LIVE_PERMISSION_REQUESTS=0`

`LIVE_SERVICE_WORKER_ACCESS=0`

`LIVE_PUSH_MANAGER_ACCESS=0`

`DATABASE_WRITES=0`

`ACCOUNT_MUTATIONS=0`

`BROWSER_LIVE_ACTIONS=0`

`ORIGIN_MAIN_MUTATION=0`
