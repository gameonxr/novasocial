# Silent Push Resubscribe Owner — Production Authorization Addendum

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Authorization date:** 2026-08-30  
**Baseline commit:** `7a6cb96455128d95152e0f5e660cf28445005a7a`  
**Immutable `origin/main`:** `ef418007c9b9a797488b4825be5f0c807da22369`

## Authorization decision

The project owner explicitly authorizes the bounded production extraction of the inline `function silentPushResubscribeIfGranted()` owner on `Branch2` only. The extraction is limited to the exact owner boundary at `index.html:1015–1024`, preserving classic `window` behavior, script order, exact immutable-origin parity, rollback, and all exclusions.

| Gate | Decision |
|---|---|
| Candidate | Inline `function silentPushResubscribeIfGranted()` |
| Exact origin parity | Required against immutable `origin/main`; preparation anchor SHA-256 `44d86219373553165ac391574670f51de306bbdc5630ce645247dae36d8f932f` |
| External owner | Required as anonymous classic assignment `window.silentPushResubscribeIfGranted = function() { ... };` |
| Validation | Detached synthetic proof, post-split parity/lifecycle proof, safe browser observation, rollback-after-split, protected accounting, and clean full Branch2 regression |
| Production decision | AUTHORIZED for this bounded owner only |
| Live effects | Must remain zero during validation |

## Explicit exclusions

This authorization excludes live permission prompts, `Notification.requestPermission()`, service-worker registration or readiness actions, PushManager subscribe/unsubscribe, VAPID conversion, subscription delivery, database token persistence, storage writes, network side effects, account mutations, Settings UI, login/bootstrap changes, and all real-account or live-browser actions. Synthetic service-worker, PushManager, permission, timer, account, and subscription-handoff objects may be used only in detached tests.

The existing `subscribeToPushNotifications()` owner remains outside this split. The owner may only perform the existing delayed synthetic handoff in proof; no real handoff is permitted during browser validation.

## Required post-split gates

The production split is not complete until the external module matches the immutable origin owner exactly after normalization, the inline declaration is absent, one classic linkage exists in the established load order, all synthetic lifecycle/error/timing/cleanup traces pass, detached rollback restores the clean baseline, the safe browser observation confirms module loading without invocation, and the complete Branch2 harness suite is green.

`EXPLICIT_FEATURE_AUTHORIZATION=PRODUCTION_BOUNDED_OWNER_ONLY`

`PRODUCTION_DECISION=AUTHORIZED_BOUNDED_EXTRACTION`

`PRODUCTION_CHANGE=1_OWNER_ONLY`

`LIVE_SIDE_EFFECTS=0`
