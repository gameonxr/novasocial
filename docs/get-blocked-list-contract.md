# NovaSocial Get Blocked List Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the extracted one-directional blocked-user ID reader.

## Contract

`getBlockedList()` performs a read-only query against `blocks`, selects only `blocked_id`, and filters rows where `blocker_id` equals `ME.id`. It converts the returned rows to a `Set` of blocked IDs and uses an empty array fallback when the data payload is absent or falsy.

The helper owns blocked-ID read conversion only. Blocking/unblocking mutations, error policy, database client configuration, and UI rendering remain outside this module. The harness is static and does not access Supabase, user sessions, or account data.

## Harness coverage

`docs/get-blocked-list-contract-harness.js` validates the function signature, table/column/filter query markers, empty-data fallback, row mapping, `Set` conversion, read-only scope, and non-ownership of mutations.

## References

1. [`get-blocked-list.js`](../src/features/get-blocked-list.js)
2. [`get-blocked-both-ways-set.js`](../src/features/get-blocked-both-ways-set.js)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

