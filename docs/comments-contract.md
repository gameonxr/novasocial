# NovaSocial Comments Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the extracted Comments feature without reading or mutating live comments.

## Contract

`openComments(pid)` creates a Comments modal, queries up to 100 comments with explicit fields and profile metadata, and falls back to an explicit comment query plus profile hydration when the joined query fails. It separately loads the current user’s comment likes, renders the empty state or comments with profile navigation and like state, and provides the comment input/send controls.

`toggleCommentLike(cmid, btn)` updates the button optimistically, inserts or deletes the current user’s comment-like row, and on a new like may notify the comment owner after reading its post context. `sendCmt(pid)` stops for a banned client, missing input, or blank text; inserts the comment with server-error handling, including the rate-limit message, then notifies the post owner when appropriate and refreshes comments. No protected DM/Reels/Calls/Stories/Notes system is owned here.

The harness is static and documentation-only. It does not open comments, insert likes/comments, send notifications, or access live data.

## Harness coverage

`docs/comments-contract-harness.js` validates query/fallback paths, cap, comment-like loading, empty and rendered states, profile and like routing, optimistic toggles, moderation guard, validation, rate-limit feedback, owner notification, and refresh.

## References

1. [`comments.js`](../src/features/comments.js)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

