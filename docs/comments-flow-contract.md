# NovaSocial Comments Flow Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the extracted comments-flow invariants before any further structural change.

## Contract

`openComments(pid)` opens the Comments modal, queries up to 100 comments in ascending creation order with explicit fields, and uses the joined-profile result when available. If the join fails, it falls back to an explicit-column comments query, fetches the referenced profiles, builds a profile map, and preserves a safe fallback username. It separately hydrates the current user’s comment likes before rendering the empty state or comment rows.

Comment rows preserve profile navigation, relative timestamps, like-state icons, and the sticky composer. `toggleCommentLike(cmid, btn)` updates the button optimistically, inserts or deletes the current user’s comment-like row, and notifies the comment owner only when the current user is not the owner. `sendCmt(pid)` stops for banned clients, missing/blank input, or failed inserts; it gives a friendly rate-limit message when applicable, otherwise a generic failure toast, and only after success notifies the post owner and refreshes the comments modal.

## Harness coverage

`docs/comments-flow-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Query | Use explicit fields, ascending order, and 100-item limit | PASS |
| Join fallback | Requery comments and hydrate profiles after join failure | PASS |
| Like hydration | Load current-user comment likes separately | PASS |
| Rendering | Preserve empty state, rows, profile navigation, timestamps, and composer | PASS |
| Like toggle | Optimistically update and insert/delete like row | PASS |
| Like notification | Notify non-owner comment author only | PASS |
| Submit guards | Stop banned, missing, and blank submissions | PASS |
| Rate limits | Preserve friendly `RATE_LIMIT_EXCEEDED` handling | PASS |
| Submit ordering | Notify and refresh only after successful insert | PASS |

The harness is deterministic and static. It does not query Supabase, mutate comments, send notifications, or open the modal.

## Safe boundary

The extracted `src/features/comments.js` module remains unchanged in this checkpoint. No DM, Notes, Story, or comment production code moved or changed.

## Validation

The standalone harness must pass with all JavaScript syntax checks, every current contract harness, `/tmp/validate_*.py` validators, inline-script validation, whitespace checks, and explicit Branch2/main reference checks.

## References

1. [`comments.js`](../src/features/comments.js)
2. [`story-reply-reaction-contract.md`](./story-reply-reaction-contract.md)
3. [`notification-dispatch-contract.md`](./notification-dispatch-contract.md)
4. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

