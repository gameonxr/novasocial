# NovaSocial Follower and Following Count Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-18
**Purpose:** Record the extracted optimistic follower/following count helper invariants as a standalone contract before any future refactor.

## Contract

`adjustFollowerCount(delta)` updates the `followers-count` element when present. It reads the numeric value from `data-raw`, adds the delta, clamps the result to zero or above, writes the raw value back, and formats the visible value through the existing `fmt()` helper.

`updateMyFollowingCount(delta)` applies the same behavior to `following-count`. Both helpers are safe no-ops when their target element is absent. The existing implementation uses `parseInt` and `Math.max`; malformed raw values therefore preserve the current `NaN` behavior rather than introducing a new fallback policy.

## Harness coverage

`docs/follower-count-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Positive delta | Update raw and visible count | PASS |
| Negative delta | Decrement raw and visible count | PASS |
| Below-zero result | Clamp to zero | PASS |
| Compact formatting | Format 1000 as `1K` | PASS |
| Malformed raw data | Preserve existing `NaN` behavior | PASS |
| Missing element | Safe no-op | PASS |

The harness is deterministic and uses mocked count elements and the existing formatting semantics only. It does not invoke real DOM, authentication, Supabase, profile, follow, or account actions.

## Safe boundary

The extracted `adjustFollowerCount()` and `updateMyFollowingCount()` helpers remain unchanged. No count, follow, profile, or account production code was rewritten in this checkpoint.

## Validation

The standalone harness passed after correcting one test-only expectation to match the production `parseInt`/`Math.max` `NaN` behavior. The complete repository validation chain also passed, including all JavaScript syntax checks, HTML/script integration checks, every `/tmp/validate_*.py` contract validator, inline application-script syntax validation, whitespace checks, protected-function markers, script load order, Branch2 verification, and confirmation that `origin/main` remained unchanged.

## References

1. [`adjust-follower-count.js`](../src/features/adjust-follower-count.js)
2. [`update-my-following-count.js`](../src/features/update-my-following-count.js)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
