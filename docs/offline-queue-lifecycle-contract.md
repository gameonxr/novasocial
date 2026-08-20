# NovaSocial Offline Queue Lifecycle Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Preserve the existing low-risk offline queue behavior for likes and follows.

## Contract

`src/core/offline.js` owns a single `window._offlineQueue` and an optional `window._offlineBanner`. The queue remains scoped to `like` and `follow` actions; posts, comments, messages, and uploads are intentionally excluded. `_queueOfflineAction()` timestamps and appends actions. `_replayOfflineQueue()` snapshots and clears the queue before replaying actions in order, supports like/follow add and remove branches, drops failed actions with a warning, and shows a synced-count toast when at least one action succeeds.

The lifecycle retains two window event listeners: `offline` shows the deduplicated banner, and `online` hides it then starts replay. Initial offline state is checked at setup time. This contract does not persist the queue, change retry policy, add new action types, or alter database calls.

## Harness coverage

`docs/offline-queue-lifecycle-contract-harness.js` statically scans `src/core/offline.js` and the Posts integration. It verifies queue initialization, supported action scope, timestamping, snapshot-before-clear ordering, like/follow replay branches, banner idempotence, two event listeners, initial offline check, and Posts’ offline queue integration. It does not access a browser, network, Supabase, authentication, or real local state.

| Check | Expected behavior | Result |
|---|---:|---|
| Queue scope | Likes and follows only | PASS |
| Queue mutation | Timestamp then append | PASS |
| Replay lifecycle | Snapshot, clear, replay in order | PASS |
| Banner behavior | Deduplicated show and safe hide | PASS |
| Event handlers | Offline show; online hide then replay | PASS |
| Initial state | Already-offline check retained | PASS |
| Production behavior | No queue or retry changes | PASS |

## Safe boundary

No production logic is changed by this audit. It records the existing offline lifecycle so future extraction cannot silently widen the queue scope or lose replay/visual feedback behavior.

## References

1. [`src/core/offline.js`](../src/core/offline.js)
2. [`src/features/posts.js`](../src/features/posts.js)
3. [`network-monitor-contract.md`](./network-monitor-contract.md)
4. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

