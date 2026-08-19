# NovaSocial Service Worker Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-19
**Purpose:** Audit the service worker after modularization and verify that PWA caching, push notifications, and notification deep links remain intact.

## Contract

`sw.js` remains an independent root-level service worker. It must install and activate without throwing, cache only the declared same-origin shell resources, use network-first behavior for navigation requests, use cache-first behavior for other same-origin GET assets, ignore non-GET and cross-origin requests, display push notifications from JSON or text fallback payloads, and route notification clicks to the stored deep-link URL.

The service worker must not import extracted application modules or depend on application globals. This keeps the service-worker execution context isolated from the inline application script and the 211 modularized JavaScript files.

## Harness coverage

`docs/service-worker-contract-harness.js` validates the following structural contract:

| Check | Expected behavior | Result |
|---|---|---|
| Root service worker | `sw.js` exists at repository root | PASS |
| Shell cache | Cache name and declared shell URLs remain present | PASS |
| Lifecycle | Install, activate, and `skipWaiting` handlers remain present | PASS |
| Fetch safety | Non-GET and cross-origin guards remain present | PASS |
| Cache strategy | Navigation network-first and asset cache-first branches remain present | PASS |
| Push | JSON parsing, text fallback, notification options, and `showNotification` remain present | PASS |
| Notification click | Notification close, existing-client focus/navigation, and open-window fallback remain present | PASS |
| Isolation | No extracted application-module imports are introduced | PASS |

The harness is static and documentation-only. It does not register a service worker, send a push message, open a notification, authenticate, call Supabase, or mutate browser state.

## Safe boundary

No production code was changed in this checkpoint. The audit confirms that `sw.js` is still self-contained and that the modularization work did not move or rewrite service-worker behavior.

## Validation

The standalone harness must pass alongside the complete Branch2 validation chain before publication. The audit is independent of the live deployment because the current Vercel URL serves `main`, not Branch2.

## References

1. [`sw.js`](../sw.js)
2. [`index.html`](../index.html)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

