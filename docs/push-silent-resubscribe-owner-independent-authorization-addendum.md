# Silent Push Resubscribe Owner — Scoped Authorization Addendum

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Authorization date:** 2026-08-25
**Baseline commit:** `f321c9ae0e6194c98c3ca6fa4b06043b72bfe62d`
**Immutable `origin/main`:** `ef418007c9b9a797488b4825be5f0c807da22369`

## Authorization decision

This addendum grants explicit scoped authorization to complete detached independent proof for the bounded inline `function silentPushResubscribeIfGranted()` owner only. It does not authorize production extraction, live permissions, service-worker access, PushManager access, database persistence, or real-account activity.

| Gate | Decision |
|---|---|
| Candidate | Inline `function silentPushResubscribeIfGranted()`, `index.html:1068–1076` |
| Exact origin parity | PASS; normalized owner SHA-256 `44d86219373553165ac391574670f51de306bbdc5630ce645247dae36d8f932f` |
| Detached proof | PASS; unsupported/default/denied/granted/logout/timing/handoff branches |
| Permission behavior | No permission request; permission state is a synthetic input |
| Subscription behavior | Existing subscription owner handoff is a synthetic mock only |
| Production extraction | NOT AUTHORIZED |
| Protected accounting | Unchanged: 19 signatures, 9 approved extracted owners, 10 blocked systems |

## Allowed proof surface

The proof may execute the exact unchanged owner with synthetic `navigator.serviceWorker`, `window.PushManager`, `Notification.permission`, `ME`, `setTimeout`, and `subscribeToPushNotifications` mocks. It may record the five-second timer, capability/permission gates, login check at callback time, and exactly one subscription handoff when permission is granted and the account remains available.

The authorized scenarios are unsupported capability, default permission, denied permission, granted permission with a logged-in account, and granted permission with logout before the timer fires. All subscription behavior must remain synthetic.

## Explicit exclusions

This authorization excludes `subscribeToPushNotifications()`, `forceResubscribePush()`, service-worker registration, PushManager subscribe/unsubscribe, VAPID conversion, database token persistence, notification delivery, Settings UI, login/bootstrap, account mutation, storage, permissions, and all live browser or real-account actions. A proof pass is not permission to split any excluded surface.

## Production re-review requirement

A future production request requires a new exact-scope production authorization, controlled non-production split, post-split parity and lifecycle proof, rollback-after-split, protected-accounting checks, and a clean full Branch2 regression. Until then:

`FEATURE_AUTHORIZATION=INDEPENDENT_PROOF_ONLY`

`PRODUCTION_DECISION=BLOCKED`

`PRODUCTION_CHANGE=0`

`LIVE_SIDE_EFFECTS=0`
