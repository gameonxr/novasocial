# Protected Push permission and silent resubscribe lifecycle — Protected Readiness Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-25
**Status:** `PREPARATION_ONLY`; production extraction remains `BLOCKED` until every gate below is independently approved.

## Scope and protected boundary

This dossier covers Notification permission, service-worker registration, push subscription, silent resubscribe, token persistence, settings UI, and failure recovery. It is a system-level preparation artifact, not a duplicate one-owner extraction contract. Existing helper-level contracts remain authoritative for already-approved owners and are not weakened by this document.

## Dependency map

Notification permission state, service-worker registration, pushManager subscription, VAPID/application server key, token persistence, settings controls, auth/account context, and silent retry timers.

Protected source markers used by the detached inventory harness:
- `pushManager`
- `Notification.requestPermission`

## Exact before/after parity boundary

Before/after must preserve permission prompts, denied/default/granted branches, service-worker readiness, subscription replacement, token persistence, account association, silent resubscribe timing, settings feedback, and failure recovery. No permission prompt may be triggered unexpectedly.

The parity comparison must use the immutable `origin/main` baseline and the Branch2 candidate snapshot. Any changed query, event, timer, global assignment, DOM mutation, storage key, media call, permission request, navigation transition, or cleanup sequence is a parity failure until explicitly authorized.

## Detached/browser-safe proof plan

Use detached Notification/service-worker/push/storage/account mocks for unsupported, denied, granted, stale subscription, resubscribe failure, logout, and retry branches. Browser-safe proof must never prompt for permissions or register against a live service worker.

Required evidence is synthetic and detached. A mock result is not production approval. Browser-safe evidence must record the shell state, mocked dependencies, expected events, forbidden side effects, and cleanup result without using a real account or live mutation.

## Rollback artifact

Pin the pre-split helper hashes and storage/event traces; rollback restores the inline helpers and removes only the external linkage. Re-run Push, service-worker, account, storage, and protected gates.

The rollback artifact must pin the pre-split commit, source owner hash, script insertion/removal boundary, and post-rollback gate results. No production extraction is eligible without this artifact.

## Explicit feature authorization

Explicit authorization must define permission timing, service-worker ownership, subscription/token schema, account association, silent retry policy, logout handling, and rollback authority.

Authorization must be written against this exact system boundary. Authorization for a helper, control, or preparation harness does not authorize the protected system itself.

## Decision and non-goals

`EXACT_BEFORE_AFTER_PARITY=REQUIRED`
`DETACHED_BROWSER_SAFE_PROOF=REQUIRED`
`ROLLBACK_ARTIFACT=REQUIRED`
`EXPLICIT_FEATURE_AUTHORIZATION=REQUIRED`
`PRODUCTION_DECISION=BLOCKED`
`PRODUCTION_CHANGE=0`
`LIVE_SIDE_EFFECTS=0`
`BROWSER_LIVE_ACTIONS=0`

This dossier does not move code, change schema, authenticate, request permissions, upload media, send messages, mutate accounts, perform moderation, or alter protected accounting. It records what must be proven before a future minimal split can be considered.

## References

1. [`high-risk-seam-readiness-matrix-contract.md`](./high-risk-seam-readiness-matrix-contract.md)
2. [`protected-inline-parity-contract.md`](./protected-inline-parity-contract.md)
3. [`reversible-browser-proof-contract.md`](./reversible-browser-proof-contract.md)
4. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
