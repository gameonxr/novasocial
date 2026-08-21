# NovaSocial Show Blocked List Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the extracted blocked-accounts list renderer.

## Contract

`showBlockedList()` creates the `Blocked Accounts` modal and renders the existing loading indicator before querying `blocks` for `blocked_id` and the related profile fields `username`, `avatar_url`, and `id`, filtered by `blocker_id = ME.id`.

It maps profile records, filters falsy profiles, renders the existing empty state when none remain, and otherwise renders avatar/name rows with `unblockUser(id, this)` delegation. The helper owns blocked-list presentation only; block mutations, database configuration, modal implementation, and profile data access remain outside this module.

The harness is static and does not access Supabase, open a modal, or unblock any account. Existing markup interpolation and query shape are documented rather than changed.

## Harness coverage

`docs/show-blocked-list-contract-harness.js` validates modal/loading setup, blocked-profile query shape, data mapping/filtering, empty state, row rendering, unblock delegation, and non-ownership of block mutations.

## References

1. [`show-blocked-list.js`](../src/features/show-blocked-list.js)
2. [`get-blocked-list.js`](../src/features/get-blocked-list.js)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

