# Push Permission Banner Owner — Independent Proof Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-25
**Status:** `INDEPENDENT_PROOF_PREPARATION`; production extraction remains `BLOCKED`.

## Candidate boundary

The candidate is the bounded inline `function maybeShowPushPermissionBanner()` owner at `index.html:1003–1059`. It covers support/permission/dismissal gating, delayed banner creation, enable-button permission handling, subscription handoff, dismissal persistence, and banner cleanup.

The candidate excludes `subscribeToPushNotifications()`, `forceResubscribePush()`, service-worker registration, PushManager operations, VAPID conversion, database persistence, notification delivery, Settings adapter code, login/bootstrap, and all other Push or account behavior.

## Dependencies and side effects

The owner depends on `navigator.serviceWorker`, `window.PushManager`, `Notification.permission`, `Notification.requestPermission()`, `ME.id`, `localStorage`, `setTimeout`, `document`, `ico`, `toast`, `subscribeToPushNotifications`, and `console`. The independent proof supplies synthetic mocks for every dependency and performs no real permission request, service-worker access, PushManager operation, database write, storage write, network call, account mutation, or browser action.

## Exact parity boundary

The independent harness extracts the owner from current Branch2 and immutable `origin/main`, normalizes only line endings, and compares the exact owner body. The normalized immutable-origin hash is pinned in `push-permission-banner-owner-independent-proof-rollback-evidence.txt`. Any owner-body difference fails parity.

## Detached proof matrix

The proof covers unsupported-browser skip, granted-permission skip, denied-permission skip, previously dismissed skip, delayed banner creation, logged-out delayed cleanup, already-visible-banner skip, enable with permission granted and successful subscription handoff, enable with non-granted permission, permission-request failure, and dismissal persistence/cleanup. Before/after traces must match exactly.

| Gate | Required result |
|---|---|
| Capability/permission gates | Unsupported, granted, and denied branches return without scheduling |
| Dismissal gate | Account-scoped localStorage flag skips the banner |
| Delayed creation | Four-second synthetic timer creates one banner only when still eligible |
| Enable grant | Permission toast, one subscription handoff, and banner removal in order |
| Enable denial | Later-settings toast, no subscription handoff, and banner removal |
| Enable error | Error is contained and banner is removed |
| Dismiss action | Account-scoped flag is written and banner is removed |
| Side-effect policy | All browser, permission, storage, network, database, account, and service-worker effects are mocked or zero |

## Authorization boundary

This contract authorizes detached independent proof only. It does not authorize production extraction, live permission prompts, PushManager access, service-worker access, or any real account action. A future extraction requires new exact-scope production authorization, controlled non-production split, post-split parity, rollback-after-split, protected-accounting checks, and full Branch2 regression.

## Decision

`EXACT_ORIGIN_PARITY=REQUIRED`
`DETACHED_SYNTHETIC_PROOF=REQUIRED`
`ROLLBACK_ARTIFACT=REQUIRED`
`EXPLICIT_FEATURE_AUTHORIZATION=REQUIRED`
`PRODUCTION_DECISION=BLOCKED`
`PRODUCTION_CHANGE=0`
`LIVE_SIDE_EFFECTS=0`
`BROWSER_LIVE_ACTIONS=0`

## References

1. [`push-permission-resubscribe-protected-readiness-contract.md`](./push-permission-resubscribe-protected-readiness-contract.md)
2. [`push-settings.js`](../src/features/push-settings.js)
3. [`high-risk-seam-readiness-matrix-contract.md`](./high-risk-seam-readiness-matrix-contract.md)
4. [`protected-inline-parity-contract.md`](./protected-inline-parity-contract.md)
5. [`push-permission-banner-owner-independent-proof-rollback-evidence.txt`](./push-permission-banner-owner-independent-proof-rollback-evidence.txt)
6. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
