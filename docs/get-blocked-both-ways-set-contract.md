# NovaSocial Get Blocked Both Ways Set Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the extracted bidirectional blocked-user content-hiding reader.

## Contract

`getBlockedBothWaysSet()` performs two `blocks` reads in parallel. The first selects `blocked_id` rows where `blocker_id` equals `ME.id`; the second selects `blocker_id` rows where `blocked_id` equals `ME.id`.

It creates a `Set`, adds each first-query `blocked_id` and each second-query `blocker_id`, using empty-array fallbacks for absent data, and returns the deduplicated union. The helper is for content hiding and remains distinct from the one-directional block list used for the current user's button label.

The helper owns read conversion only. Block/unblock mutations, error policy, database configuration, and UI filtering remain outside this module. The harness is static and does not access Supabase or user data.

## Harness coverage

`docs/get-blocked-both-ways-set-contract-harness.js` validates parallel directional reads, selected columns, reciprocal filters, empty fallbacks, Set union, deduplication scope, and non-ownership of mutations.

## References

1. [`get-blocked-both-ways-set.js`](../src/features/get-blocked-both-ways-set.js)
2. [`get-blocked-list.js`](../src/features/get-blocked-list.js)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

