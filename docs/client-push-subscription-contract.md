# NovaSocial Client Push-Subscription Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Preserve the client-side PushManager subscription and database synchronization boundary.

## Contract

`subscribeToPushNotifications()` remains a non-throwing helper. It rejects unsupported browsers and missing `ME.id`, obtains `navigator.serviceWorker.ready`, reuses an existing PushManager subscription when available, creates a new one with `userVisibleOnly: true` and the current VAPID key when needed, serializes the subscription, and upserts the endpoint/device fields into `push_subscriptions` with `.throwOnError()`. Success returns `true`; all failures return `false`.

`forceResubscribePush()` retains its guarded sequence: obtain the ready registration, unsubscribe the existing browser subscription when present, delete its endpoint row from `push_subscriptions`, call the normal subscribe helper, and return that result. Settings enable/reset entry points retain permission and support guards.

This contract documents the current behavior only. It does not rotate the public VAPID key, change permission UX, add retry/backoff, alter push payloads, or execute a live subscription.

## Harness coverage

`docs/client-push-subscription-contract-harness.js` statically scans `index.html` and verifies both helper boundaries, support/auth guards, PushManager reuse/creation, VAPID application, DB upsert/delete ordering markers, non-throwing return markers, and Settings integration. It does not request permission, access a service worker, subscribe a device, call Supabase, or mutate browser state.

| Check | Expected behavior | Result |
|---|---:|---|
| Normal subscription | Reuse/create, serialize, upsert, return true | PASS |
| Failure boundary | Catch and return false | PASS |
| Force reset | Unsubscribe, delete endpoint, fresh subscribe | PASS |
| Settings integration | Enable/reset guards retained | PASS |
| Runtime side effects | None in harness | PASS |

## Safe boundary

No production logic is changed by this audit. It records the client push seam so future modularization cannot silently lose endpoint cleanup, DB synchronization, or non-throwing failure behavior.

## References

1. [`index.html`](../index.html)
2. [`service-worker-contract.md`](./service-worker-contract.md)
3. [`pwa-manifest-contract.md`](./pwa-manifest-contract.md)
4. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

