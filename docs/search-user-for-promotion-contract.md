# NovaSocial Staff Search Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-18
**Purpose:** Record the protected staff-management search invariants before any future refactor.

## Contract

`searchUserForPromotion(query)` cancels the previous timer and schedules a new search after 300 milliseconds. Inside the deferred callback, it obtains `#team-search-results`; a missing element is a no-op. Queries whose trimmed length is below two characters clear the results and do not query the backend.

For valid queries, the helper trims the input, applies a case-insensitive username `ilike` pattern, excludes the current user, and limits the result set to five profiles. Empty results render a stable “No users found” state. Query failures render a safe “Search failed” state without escaping through the input handler.

Each result displays the user identity and avatar. Existing administrators, moderators, or super administrators receive an “Already staff” indicator. Non-staff users receive a moderator-promotion action, and callers with `PROF.is_super_admin === true` additionally receive the administrator-promotion action.

## Harness coverage

`docs/search-user-for-promotion-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Short query | Deferred clear with no database request | PASS |
| Debounce | Previous timer is replaced and delay is 300 ms | PASS |
| Query construction | Trimmed `ilike`, self-exclusion, and limit five | PASS |
| Ordinary caller | Moderator action only for non-staff users | PASS |
| Super-admin caller | Moderator and administrator actions for non-staff users | PASS |
| Existing staff | “Already staff” indicator | PASS |
| Empty results | Stable empty state | PASS |
| Query failure | Stable failure state | PASS |
| Missing result element | No-op | PASS |

The harness evaluates the exact production function body inside mocked DOM, timer, identity, role, escaping, avatar, and database boundaries. It does not invoke real authentication, Supabase, promotion RPCs, account actions, or admin authorization.

## Safe boundary

The protected staff-management implementation remains inline and unchanged. No production admin search, promotion, demotion, moderation, or account code was moved or rewritten in this checkpoint.

## Validation

The standalone harness passed. The harness is ready for inclusion in the repository’s documentation-only contract set after the complete repository validation chain passes.

## References

1. [`index.html` staff search implementation](../index.html)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
