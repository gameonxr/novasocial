# NovaSocial Block and Unblock Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-18
**Purpose:** Record the protected blocking mutation, duplicate handling, cleanup, and UI synchronization invariants as a standalone contract before any future refactor.

## Contract

`blockUser(userId, btn)` requires the themed confirmation dialog before mutating the block relation. The block insert uses `.throwOnError()` and only after success shows blocked feedback and changes the optional button to `Unblock`.

A duplicate-block `23505` error is treated as an already-blocked race rather than a generic failure. It shows duplicate-state feedback and synchronizes the optional button to `Unblock`. Other block errors show retry feedback and preserve the original button state.

After a successful block, auto-unfollow deletes follow relations in both directions. Cleanup of the current user’s post likes/comments from the blocked user is also attempted. These cleanup operations are noncritical: a cleanup failure does not roll back the successful block.

`unblockUser(userId, btn)` deletes the exact current-user/target-user block relation with `.throwOnError()`. On success it shows unblocked feedback and restores the optional button to `Block`; on failure it shows retry feedback and preserves the current button state.

## Harness coverage

`docs/block-unblock-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Confirmation cancelled | Stop before mutation | PASS |
| Successful block | Insert, update UI, auto-unfollow, clean engagement | PASS |
| Duplicate block `23505` | Synchronize UI to Unblock | PASS |
| Generic block failure | Preserve button state and show failure | PASS |
| Cleanup failure | Keep successful block noncritical | PASS |
| No owned posts | Skip engagement cleanup safely | PASS |
| Successful unblock | Delete and restore Block state | PASS |
| Unblock failure | Preserve button state and show failure | PASS |

The harness is deterministic and uses mocked confirmation, database, cleanup, toast, and button events only. It does not invoke real DOM, Supabase, authentication, blocks, follows, likes, comments, profiles, or account actions.

## Safe boundary

The protected `blockUser()` and `unblockUser()` implementations and blocking/database boundaries remain inline and unchanged. No blocking, moderation, follow, engagement, profile, or account production code was moved or rewritten in this checkpoint.

## Validation

The standalone harness passed. The complete repository validation chain also passed, including all JavaScript syntax checks, HTML/script integration checks, every `/tmp/validate_*.py` contract validator, inline application-script syntax validation, whitespace checks, protected-function markers, script load order, Branch2 verification, and confirmation that `origin/main` remained unchanged.

## References

1. [`index.html` block/unblock implementation](../index.html)
2. [`CRITICAL_CONTEXT.md`](../../upload/CRITICAL_CONTEXT.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
