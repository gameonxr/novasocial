# NovaSocial Report Submission Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-18
**Purpose:** Record the protected report-submission validation and error-feedback invariants as a standalone contract before any future refactor.

## Contract

`submitReport(targetType, targetId, reason)` closes the report modal before attempting the database insert. The inserted record contains the current reporter ID, target type, target ID, selected reason, and `pending` status.

A successful insert shows administrator-review feedback. If the reports table is missing, the function detects the relation-not-found message and provides setup-specific guidance. All other database failures show the underlying error in generic report-failure feedback. The modal remains closed in every branch because closure happens before the database attempt.

## Harness coverage

`docs/report-submission-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Successful report | Preserve payload fields and pending status | PASS |
| Success feedback | Close modal and confirm submission | PASS |
| Missing reports table | Show Stage 0 setup guidance | PASS |
| Generic database/RLS error | Show error-specific failure feedback | PASS |
| Failure modal state | Modal already closed before database attempt | PASS |

The harness is deterministic and uses mocked report, modal, database, and toast events only. It does not invoke real DOM, Supabase, authentication, reports, or user actions.

## Safe boundary

The protected `submitReport()` implementation and report/database boundaries remain inline and unchanged. No report, moderation, authentication, or database production code was moved or rewritten in this checkpoint.

## Validation

The standalone harness passed. The complete repository validation chain also passed, including all JavaScript syntax checks, HTML/script integration checks, every `/tmp/validate_*.py` contract validator, inline application-script syntax validation, whitespace checks, protected-function markers, script load order, Branch2 verification, and confirmation that `origin/main` remained unchanged.

## References

1. [`index.html` report-submission implementation](../index.html)
2. [`CRITICAL_CONTEXT.md`](../../upload/CRITICAL_CONTEXT.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
