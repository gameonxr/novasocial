# Push Permission Banner Owner — Production Split Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Baseline:** `4b6c301cda56c60d279f43a6d6848029a88cd7d3`
**Owner:** `maybeShowPushPermissionBanner()`
**Module:** `src/features/push-permission-banner-owner.js`

## Scope

This contract covers only the bounded `maybeShowPushPermissionBanner()` owner extracted from `index.html`. The classic global handoff is `window.maybeShowPushPermissionBanner`. The caller, `showApp()`, remains unchanged. The module is linked exactly once before the inline application script so the global is available without changing runtime dependency order.

## Required parity and lifecycle gates

The normalized extracted owner must match the immutable `origin/main` owner exactly. The HTML must contain zero inline `maybeShowPushPermissionBanner()` declarations and exactly one module linkage. The module must expose exactly one classic `window` owner. Unsupported, granted, denied, dismissed, delayed-create, logged-out cleanup, existing-banner, enable-granted, enable-denied, enable-error, and dismissal scenarios must retain identical traces, timing, DOM, cleanup, and handoff behavior.

The detached proof must use synthetic `navigator.serviceWorker`, `window.PushManager`, `Notification`, `ME`, `localStorage`, timers, DOM, `ico`, `toast`, `subscribeToPushNotifications`, and `console` seams. It must perform zero live permission requests, service-worker access, PushManager access, network calls, database writes, account mutations, or real browser actions.

## Exclusions

The split excludes `subscribeToPushNotifications()`, `forceResubscribePush()`, service-worker registration or access, PushManager subscription or unsubscribe, VAPID conversion, database persistence, notification delivery, Settings adapter changes, login/bootstrap, account mutation, storage outside the existing dismissal flag, and all unrelated Push behavior.

## Rollback and publication

A disposable apply-and-reverse proof must restore the exact clean Branch2 baseline. Production publication requires protected accounting, clean whitespace, exact script order, fresh safe browser module loading, and the complete Branch2 harness regression. Any failed gate requires rollback and no publication.

`EXACT_ORIGIN_PARITY=REQUIRED`

`DETACHED_LIFECYCLE_PROOF=REQUIRED`

`SAFE_BROWSER_OBSERVATION=REQUIRED`

`ROLLBACK_AFTER_SPLIT=REQUIRED`

`PRODUCTION_DECISION=AUTHORIZED_FOR_BOUNDED_OWNER_ONLY`

`LIVE_PERMISSION_REQUESTS=0`

`LIVE_SERVICE_WORKER_ACCESS=0`

`LIVE_PUSH_MANAGER_ACCESS=0`

`DATABASE_WRITES=0`

`ACCOUNT_MUTATIONS=0`
