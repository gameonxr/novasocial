# NovaSocial Search Admin Users Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the read-only admin user search helper without executing database access.

## Contract

`searchAdminUsers(query)` clears the prior `_adminUserSearchTimer` and schedules a 300-millisecond search. It locates `#admin-user-list` inside the timer and returns without mutation when absent.

The query selects the documented profile identity, moderation-state, timestamp, and post-count fields, orders newest profiles first, limits to 50, and applies a trimmed case-insensitive username filter only when the query is non-empty. Empty results render the existing no-users state; query errors render the existing failure state.

Results render escaped username and full-name output, avatar data, admin/banned/message-banned badges, post count, and `showAdminUserDetail(id)` navigation. The helper is read-only and does not mutate moderation state or perform destructive admin actions.

The harness is static and documentation-only. It does not start a timer, query profiles, or open user details.

## Harness coverage

`docs/search-admin-users-contract-harness.js` validates debounce and timer cancellation, list guard, selected profile fields, ordering and cap, optional trimmed ilike filter, empty/error states, escaped output, moderation badges, and detail routing.

## References

1. [`search-admin-users.js`](../src/features/search-admin-users.js)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

