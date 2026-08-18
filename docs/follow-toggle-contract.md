# NovaSocial Follow and Unfollow Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-18
**Purpose:** Record the protected follow/unfollow optimistic-state, offline, rollback, and cache invariants as a standalone contract before any future refactor.

## Contract

`toggleFollowProfile(userId)` reads the current button state, flips the intended follow state optimistically, updates the profile follower count and current-user following count, and updates the button label/class immediately.

When offline, it skips the database mutation and queues the follow action for replay while retaining the optimistic UI state. When online, follow inserts a relation and sends a follow notification after a successful insert; unfollow deletes the relation. Successful completion refreshes profile counts, shows success feedback, and invalidates profile and Home caches.

If the database mutation fails, the function restores the original button state, reverses both optimistic count updates, and shows network-error feedback. Missing button elements are handled as a safe no-op.

## Harness coverage

`docs/follow-toggle-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Successful follow | Optimistic state, insert, notification, count refresh, cache invalidation | PASS |
| Successful unfollow | Delete relation, restore Follow state, refresh/invalidate | PASS |
| Offline follow | Retain optimistic state and queue action | PASS |
| Failed follow | Roll back UI and counts | PASS |
| Failed unfollow | Roll back UI and counts | PASS |
| Missing button | Safe no-op | PASS |

The harness is deterministic and uses mocked button, count, queue, database, notification, toast, and cache events only. It does not invoke real DOM, Supabase, authentication, follows, notifications, profiles, or account actions.

## Safe boundary

The protected `toggleFollowProfile()` implementation and follow/count/cache boundaries remain inline and unchanged. No follow, unfollow, profile, notification, or account production code was moved or rewritten in this checkpoint.

## Validation

The standalone harness passed. The complete repository validation chain also passed, including all JavaScript syntax checks, HTML/script integration checks, every `/tmp/validate_*.py` contract validator, inline application-script syntax validation, whitespace checks, protected-function markers, script load order, Branch2 verification, and confirmation that `origin/main` remained unchanged.

## References

1. [`index.html` follow/unfollow implementation](../index.html)
2. [`CRITICAL_CONTEXT.md`](../../upload/CRITICAL_CONTEXT.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
