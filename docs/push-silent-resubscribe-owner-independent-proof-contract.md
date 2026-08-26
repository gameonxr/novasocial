# Silent Push Resubscribe Owner — Independent Proof Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-25
**Status:** `INDEPENDENT_PROOF_PREPARATION`; production extraction remains `BLOCKED`.

## Candidate boundary

The candidate is the bounded inline `function silentPushResubscribeIfGranted()` owner at `index.html:1068–1076`. It covers capability and permission gating, a five-second deferred retry, logout handling at callback time, and one handoff to the existing `subscribeToPushNotifications()` owner.

The candidate excludes `subscribeToPushNotifications()`, `forceResubscribePush()`, service-worker registration, PushManager operations, VAPID conversion, database token persistence, permission prompts, Settings UI, login/bootstrap, notification delivery, and all other Push behavior.

## Dependencies and side effects

The owner depends on `navigator.serviceWorker`, `window.PushManager`, `Notification.permission`, `ME`, `setTimeout`, and `subscribeToPushNotifications`. The independent proof provides synthetic mocks for every dependency. No real permission prompt, service-worker access, PushManager access, database write, storage write, network call, account mutation, or browser action is allowed.

## Exact parity boundary

The independent harness extracts the owner from current Branch2 and immutable `origin/main`, normalizes only line endings, and compares the exact owner body. The immutable-origin hash is pinned in `push-silent-resubscribe-owner-independent-proof-rollback-evidence.txt`. Any owner-body difference fails parity.

## Detached proof matrix

The proof covers unsupported capability, default permission, denied permission, granted permission with a logged-in account, granted permission with logout before the timer fires, the exact five-second delay, one subscription handoff, and no permission prompt or direct service-worker/PushManager operation. Before/after traces must match exactly.

| Gate | Required result |
|---|---|
| Capability gate | Unsupported browser schedules nothing |
| Permission gate | Default/denied permission schedules nothing; granted permission proceeds |
| Timing | Granted path schedules exactly one 5000ms callback |
| Account guard | Logged-out callback does not subscribe |
| Handoff | Logged-in granted callback calls existing subscribe owner exactly once |
| Scope isolation | Owner does not directly touch DB, storage, service worker, PushManager, or permissions |
| Side-effect policy | All live effects zero; handoff is a synthetic mock only |

## Authorization boundary

This contract authorizes detached independent proof only. It does not authorize production extraction, live permission prompts, service-worker access, PushManager access, database persistence, or any real-account action. A future extraction requires new exact-scope production authorization, controlled non-production split, post-split parity, rollback-after-split, protected-accounting checks, and full Branch2 regression.

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
2. [`push-permission-banner-owner-independent-proof-contract.md`](./push-permission-banner-owner-independent-proof-contract.md)
3. [`high-risk-seam-readiness-matrix-contract.md`](./high-risk-seam-readiness-matrix-contract.md)
4. [`protected-inline-parity-contract.md`](./protected-inline-parity-contract.md)
5. [`push-silent-resubscribe-owner-independent-proof-rollback-evidence.txt`](./push-silent-resubscribe-owner-independent-proof-rollback-evidence.txt)
6. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
