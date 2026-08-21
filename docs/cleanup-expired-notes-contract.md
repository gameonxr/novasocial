# NovaSocial Cleanup Expired Notes Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Purpose:** Lock the static safety boundaries of the expired quick-note cleanup controller without deleting records or media.

## Contract

`cleanupExpiredNotes()` is one-shot guarded by `window._expiredNotesCleaned`; it returns immediately after the guard has been set when the cleanup has already run. It queries `quick_notes` for records whose `expires_at` is earlier than the current ISO timestamp, selects only `id` and `music_artwork`, and limits the batch to 100 records.

When expired records exist, only artwork URLs containing `cloudinary.com` are passed to the existing `deleteMultipleMediaProduction(mediaUrls, 'note', 'expired_story')` boundary. Related `quick_note_views` and `quick_note_reactions` rows are deleted with settled parallel operations, followed by deletion of the corresponding `quick_notes` rows.

The controller treats empty results as a no-op and catches failures as non-critical errors. The contract does not authorize moving protected note systems or performing deletion in the harness.

## Harness coverage

`docs/cleanup-expired-notes-contract-harness.js` validates the one-shot guard, bounded expiration query, Cloudinary-only media cleanup, related-data deletion, primary-note deletion, success/error logging, and non-critical error boundary.

## References

1. [`cleanup-expired-notes.js`](../src/features/cleanup-expired-notes.js)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

