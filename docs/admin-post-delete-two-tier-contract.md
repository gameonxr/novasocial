# NovaSocial Admin Two-Tier Post Delete Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-18
**Purpose:** Record the protected soft-delete, hard-delete, recovery, and deleted-post-list invariants before any future refactor.

## Contract

`adminSoftDeletePost(postId, reason)` marks the post as deleted, records the deleting admin, stores the `admin_soft` deletion type and reason, and schedules `auto_purge_at` approximately 30 days ahead. It audits the action, shows a recoverable-success toast, and returns `true`. Soft delete does not delete Cloudinary media. Update failures are caught, surfaced through a failure toast, and return `false`.

`adminHardDeletePost(postId, userId, reason)` first fetches media metadata, attempts cleanup of related likes, comments, bookmarks, views, and notifications, deletes the post row, then deletes associated media using the production media engine. Video media is classified as reel media. It audits the permanent deletion, optionally notifies the owner, shows success, and returns `true`. A post-row failure prevents media cleanup, shows a failure toast, and returns `false`. Related cleanup uses `Promise.allSettled` so an individual related-table failure does not prevent the main post-delete path.

`adminRecoverPost(postId)` clears every soft-delete field, audits the recovery, shows success, conditionally refreshes the deleted-post list, and returns `true`. Recovery failures return `false` with a failure toast.

`loadAdminDeletedPosts()` reads up to 50 soft-deleted posts in descending deletion order, renders owner, escaped caption, elapsed deletion time, remaining retention time, and a Recover action, and shows stable empty or escaped error states.

## Harness coverage

`docs/admin-post-delete-two-tier-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Soft delete | Recoverable fields, admin identity, reason, and 30-day purge are stored | PASS |
| Soft media policy | Media deletion is not invoked | PASS |
| Soft failure | Returns false and shows failure toast | PASS |
| Hard ordering | Media fetch, related cleanup, row delete, media delete, audit, notification | PASS |
| Hard media type | Video maps to reel media deletion | PASS |
| Hard row failure | Returns false and does not reach media deletion | PASS |
| Recovery | All soft-delete fields are cleared and action is audited | PASS |
| Recovery refresh | Guarded deleted-list refresh delegation is preserved | PASS |
| Deleted list | Owner, escaped caption, retention, and Recover action render | PASS |
| Empty list | Stable empty state renders | PASS |
| List failure | Escaped error state renders | PASS |

The harness uses mocked database operations, media cleanup, audit logging, notifications, toasts, DOM, and date helpers only. It does not invoke real authentication, Supabase, Cloudinary, notifications, or account mutations.

## Safe boundary

The protected two-tier delete/recover implementation remains inline and unchanged. No production deletion, media, moderation, audit, notification, or account code was moved or rewritten in this checkpoint.

## Validation

The standalone harness passed. The complete repository validation chain must pass before this contract and harness are published to `docs/`.

## References

1. [`index.html` two-tier post-delete implementation](../index.html)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
