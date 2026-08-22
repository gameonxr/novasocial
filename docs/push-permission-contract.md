# NovaSocial Push Permission Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-18
**Purpose:** Record the safe mocked Push permission seam without moving protected subscription mutation handlers.

## Contract

The Push permission banner is shown only when Service Worker and Push APIs are supported, permission is neither `granted` nor `denied`, the account has not dismissed the banner, and the active user still exists when the delayed banner callback runs. A previously granted permission skips the banner and schedules a silent resubscribe. A denied permission is respected and does not prompt. A dismissed banner remains suppressed by the account-scoped localStorage key.

When the user explicitly requests permission, a granted result produces the enabled toast and calls Push subscription; a non-granted result produces the defer toast. Both paths remove the banner. The delayed callbacks must guard against the user logging out before they run.

## Mock harness result

`/tmp/push_permission_contract_harness.js` validates unsupported, granted, denied, dismissed, logged-out, and promptable states plus granted/denied permission-request outcomes. The deterministic harness passed without invoking real Notification, Service Worker, PushManager, subscription, database, or account APIs. Its injected evaluator/request seam is test-only and is not loaded by `index.html`; production permission and subscription owners remain inline.

## Safe boundary

The protected `maybeShowPushPermissionBanner()` and `silentPushResubscribeIfGranted()` owners, along with the `enablePushFromSettings` and `resetPushFromSettings` handlers, remain inline. No Push subscription mutation, service-worker code, auth lifecycle, or production permission behavior was moved or rewritten. A future Push refactor requires permission-state, subscription-error, service-worker, and logout-race tests before implementation changes.

## References

1. [Critical runtime safeguards](file:///home/ubuntu/upload/CRITICAL_CONTEXT.md)
2. [Current migration map](file:///home/ubuntu/novasocial/MIGRATION_MAP.md)
3. [Inline Push permission logic](file:///home/ubuntu/novasocial/index.html)
