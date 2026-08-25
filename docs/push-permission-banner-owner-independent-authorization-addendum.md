# Push Permission Banner Owner — Scoped Authorization Addendum

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Authorization date:** 2026-08-25
**Baseline commit:** `717233e6b1b1a7a5467e6e72028d5cc61cba9753`
**Immutable `origin/main`:** `ef418007c9b9a797488b4825be5f0c807da22369`

## Authorization decision

This addendum grants explicit scoped authorization to complete detached independent proof for the bounded inline `function maybeShowPushPermissionBanner()` owner only. It does not authorize production extraction, live permission prompts, service-worker access, PushManager access, or real-account activity.

| Gate | Decision |
|---|---|
| Candidate | Inline `function maybeShowPushPermissionBanner()`, `index.html:1003–1059` |
| Exact origin parity | PASS; normalized owner SHA-256 `17186cae241a0283e020fec128598bcbfcbc452ba913f652601f237e1fd0c84b` |
| Detached proof | PASS; support/permission/dismissal gates, delayed creation, logout cleanup, enable grant/denial/error, persistence, and cleanup |
| Permission behavior | Mock-only; no real `Notification.requestPermission()` call |
| Production extraction | NOT AUTHORIZED |
| Protected accounting | Unchanged: 19 signatures, 9 approved extracted owners, 10 blocked systems |

## Allowed proof surface

The proof may execute the exact unchanged owner with synthetic `navigator.serviceWorker`, `window.PushManager`, `Notification`, `ME.id`, `localStorage`, `setTimeout`, `document`, `ico`, `toast`, `subscribeToPushNotifications`, and `console` mocks. It may record delayed timer behavior, banner DOM construction, account-scoped dismissal keys, permission result handling, subscription handoff, and banner removal.

The authorized scenarios are unsupported capability, already-granted permission, already-denied permission, previously dismissed account, eligible delayed creation, logout before delayed creation, existing visible banner, enable-granted, enable-denied, permission-request error, and dismissal. All permission and subscription operations must remain synthetic.

## Explicit exclusions

This authorization excludes `subscribeToPushNotifications()`, `forceResubscribePush()`, service-worker registration, PushManager subscription or unsubscribe, VAPID conversion, database persistence, notification delivery, Settings adapter changes, login/bootstrap, account mutation, storage outside the synthetic dismissal flag, and all live browser or real-account actions. A proof pass is not permission to split any excluded surface.

## Production re-review requirement

A future production request requires a new exact-scope production authorization, controlled non-production split, post-split parity and lifecycle proof, rollback-after-split, protected-accounting checks, and a clean full Branch2 regression. Until then:

`FEATURE_AUTHORIZATION=INDEPENDENT_PROOF_ONLY`

`PRODUCTION_DECISION=BLOCKED`

`PRODUCTION_CHANGE=0`

`LIVE_SIDE_EFFECTS=0`
