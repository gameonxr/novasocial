# NovaSocial Close Friends Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the extracted Close Friends manager invariants before any further structural change.

## Contract

`showCloseFriendsManager()` opens the existing Close Friends modal, renders a loading state, queries the current user’s following list with profile fields, and parses the profile’s `close_friends` JSON array with malformed-data tolerance. It renders a stable empty state when there are no followed users and otherwise preserves the explanatory header, scrollable user list, and per-user Add/Added button state.

`toggleCloseFriend(uid)` toggles only the selected user ID in the parsed close-friends list, provides immediate add/remove feedback, persists the JSON array to the current profile, updates the in-memory profile, and refreshes the selected button state. Persistence failures remain contained by the existing error toast boundary.

## Harness coverage

`docs/close-friends-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Manager entry | Open modal and show loading state | PASS |
| Following query | Read current user’s following profiles | PASS |
| Profile parsing | Tolerate malformed close-friends JSON | PASS |
| Empty state | Render stable no-following message | PASS |
| User state | Preserve Add/Added state for each followed profile | PASS |
| Toggle | Add/remove only the selected user ID | PASS |
| Persistence | Update profile JSON and in-memory state | PASS |
| Button refresh | Update selected control after persistence | PASS |
| Failure feedback | Contain database failure with an error toast | PASS |

The harness is deterministic and static. It does not query Supabase, mutate profiles, or alter real close-friend lists.

## Safe boundary

The extracted `src/features/close-friends.js` module remains unchanged in this checkpoint. No Stories, privacy, profile, or account production code moved or changed.

## Validation

The standalone harness must pass with all JavaScript syntax checks, every current contract harness, `/tmp/validate_*.py` validators, inline-script validation, whitespace checks, and explicit Branch2/main reference checks.

## References

1. [`close-friends.js`](../src/features/close-friends.js)
2. [`follow-toggle-contract.md`](./follow-toggle-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

