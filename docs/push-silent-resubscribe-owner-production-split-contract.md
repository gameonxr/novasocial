# Silent Push Resubscribe Owner — Production Split Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Owner:** `silentPushResubscribeIfGranted()`  
**Module:** `src/features/push-silent-resubscribe-owner.js`

## Required gates

`EXACT_ORIGIN_PARITY=PASS`

`EXTERNAL_OWNER_TYPE=function`

`INLINE_OWNER_DECLARATIONS=0`

`EXTERNAL_SCRIPT_LINKAGES=1`

`DETACHED_LIFECYCLE_PROOF=PASS`

`ROLLBACK_AFTER_SPLIT=PASS`

`SAFE_BROWSER_OBSERVATION=REQUIRED`

`FULL_BRANCH2_REGRESSION=REQUIRED`

`LIVE_SIDE_EFFECTS=0`

## Behavioral invariants

The external owner must preserve the exact immutable-origin body. Unsupported capability and non-granted permission must return without scheduling. Granted permission may schedule exactly one five-second callback; the callback must stop when `ME` is absent and may perform only the existing synthetic subscription handoff in detached proof. Timer cleanup, handoff cardinality, and all error/permission boundary behavior must remain unchanged.

## Explicit exclusions

Validation must not invoke live permission prompts, service-worker registration or readiness, PushManager subscribe/unsubscribe, VAPID conversion, subscription delivery, database persistence, storage writes, network side effects, account mutations, Settings UI, login/bootstrap, or real-browser/real-account activity. `subscribeToPushNotifications()` is outside this split and must remain an injected synthetic seam only.

`PRODUCTION_DECISION=SPLIT_COMPLETE_ONLY_AFTER_ALL_GATES`

`PRODUCTION_CHANGE=1_OWNER_ONLY`

`LIVE_PERMISSION_REQUESTS=0`

`LIVE_SERVICE_WORKER_ACCESS=0`

`LIVE_PUSH_MANAGER_ACCESS=0`

`DATABASE_WRITES=0`
