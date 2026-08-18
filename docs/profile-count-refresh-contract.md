# NovaSocial Profile Count Refresh Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-18
**Purpose:** Record the protected profile-count refresh query and DOM synchronization invariants as a standalone contract before any future refactor.

## Contract

`refreshProfileCounts(userId)` queries the target profile’s `followers_count` and the current user’s `following_count` in parallel. When the corresponding count element exists, it writes the raw count to `data-raw` and formats the visible text through the existing `fmt()` helper.

Missing or falsy count values fall back to zero for DOM display. A missing follower or following element does not prevent the other available element from updating. Any query or refresh failure is caught and remains silent, preserving the feature’s best-effort refresh behavior.

## Harness coverage

`docs/profile-count-refresh-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Target and current-user queries | Execute both count queries | PASS |
| Normal counts | Update raw data and formatted text | PASS |
| Zero/missing values | Fall back to zero | PASS |
| Missing follower element | Preserve available following update | PASS |
| Target query failure | Fail silently without partial fake data | PASS |
| Current-user query failure | Fail silently without partial fake data | PASS |

The harness is deterministic and uses mocked profile queries, count elements, and formatter events only. It does not invoke real DOM, Supabase, authentication, profiles, follow, or account actions.

## Safe boundary

The protected `refreshProfileCounts()` implementation and profile/follow count boundaries remain inline and unchanged. No profile, follow, count, or account production code was moved or rewritten in this checkpoint.

## Validation

The standalone harness passed. The complete repository validation chain also passed, including all JavaScript syntax checks, HTML/script integration checks, every `/tmp/validate_*.py` contract validator, inline application-script syntax validation, whitespace checks, protected-function markers, script load order, Branch2 verification, and confirmation that `origin/main` remained unchanged.

## References

1. [`index.html` profile-count refresh implementation](../index.html)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
