# NovaSocial Emergency-Lock Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-18
**Purpose:** Record the security-critical emergency-lock behavior as a non-invasive contract and deterministic mock harness before any future refactor is considered.

## Contract

`checkEmergencyLock()` reads the `emergency_lock` value from the `feature_flags` table. The application enters the emergency-lock overlay when the returned value is the boolean `true`, the string `"true"`, or an object whose `toString()` result is `"true"`. Boolean `false` and the string `"false"` do not activate the overlay.

The feature-flag database call is enclosed by a fail-silent `try/catch`. When the database operation throws, the error is intentionally ignored, no emergency-lock overlay is shown, and the polling timer setup still proceeds. The harness models this correctly by making the mocked `single()` call throw; returning `{ data: null, error }` would not exercise the production catch path.

Before scheduling the next check, an existing emergency-lock interval is cleared. A new interval is then started with a 60-second delay on every invocation, including truthy, false, and database-error outcomes. This prevents duplicate polling timers while retaining periodic security checks.

`showEmergencyLockScreen()` is idempotent in production: it checks for an existing emergency-lock overlay before creating another one. The standalone harness validates the invocation boundary without constructing real DOM elements.

## Harness coverage

`docs/emergency-lock-contract-harness.js` covers the following branches:

| Scenario | Expected behavior | Result |
|---|---|---|
| Boolean `true` | Show overlay; clear and restart 60-second timer | PASS |
| String `"true"` | Show overlay; clear and restart 60-second timer | PASS |
| String-object `"true"` | Show overlay through `toString()` normalization | PASS |
| Boolean `false` | Do not show overlay; restart timer | PASS |
| String `"false"` | Do not show overlay; restart timer | PASS |
| Database exception | Fail silently; do not show overlay; restart timer | PASS |

The harness is deterministic and does not invoke real Supabase, DOM, intervals, authentication, or security-overlay code.

## Safe boundary

No emergency-lock production code was extracted or rewritten. The security-critical `checkEmergencyLock()` and `showEmergencyLockScreen()` functions remain inline in `index.html`. The harness and contract are documentation-only safeguards for a future refactor review.

## Validation

The corrected harness passed. The complete repository validation chain also passed, including JavaScript syntax checks, HTML/script integration checks, every `/tmp/validate_*.py` contract validator, inline application-script syntax validation, whitespace checks, protected-function markers, script load order, Branch2 verification, and confirmation that `origin/main` remained unchanged.

## References

1. [`index.html` emergency-lock implementation](../index.html)
2. [`CRITICAL_CONTEXT.md`](../../upload/CRITICAL_CONTEXT.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
