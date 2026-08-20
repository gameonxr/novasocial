# NovaSocial Scheduled Posts Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the extracted scheduled-posts state and rendering invariants before any further structural change.

## Contract

The scheduled-posts module initializes the shared `scheduledPosts` state from the `nova-scheduled` local-storage key and tolerates malformed or unavailable storage by retaining an empty in-memory list. `showScheduledPosts()` opens the existing modal boundary and renders a stable empty state when no scheduled entries exist.

When entries exist, the renderer preserves array order, shows optional media with a placeholder fallback, escapes no new semantics beyond the existing template behavior, displays caption and localized scheduled time, and exposes the existing index-based delete action. `deleteScheduledPost(idx)` requires confirmation, removes only the selected in-memory entry, persists the updated array under the same key, refreshes the modal, and shows success feedback. Persistence failures remain swallowed at the existing local-storage boundary.

## Harness coverage

`docs/scheduled-posts-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Storage initialization | Restore `scheduledPosts` from `nova-scheduled` | PASS |
| Malformed storage | Tolerate parse/storage failure | PASS |
| Empty state | Render stable no-scheduled-posts state | PASS |
| Ordered rendering | Preserve entry order and media/caption/time fields | PASS |
| Delete confirmation | Cancel without mutation | PASS |
| Delete persistence | Remove selected index, persist, refresh, and toast | PASS |
| Storage write failure | Keep UI path non-throwing | PASS |

The harness is deterministic and static. It does not read real local storage, open modals, prompt users, or mutate scheduled posts.

## Safe boundary

The extracted `src/features/scheduled-posts.js` module remains unchanged in this checkpoint. No scheduled-post production code moved or was rewritten.

## Validation

The standalone harness must pass with all JavaScript syntax checks, every current contract harness, `/tmp/validate_*.py` validators, inline-script validation, whitespace checks, and explicit Branch2/main reference checks.

## References

1. [`scheduled-posts.js`](../src/features/scheduled-posts.js)
2. [`post-creation-flow-contract.md`](./post-creation-flow-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

