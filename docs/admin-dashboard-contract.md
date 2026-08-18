# NovaSocial Admin Dashboard Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-18
**Purpose:** Record the protected admin dashboard metric aggregation and rendering invariants as a standalone contract before any future refactor.

## Contract

`adminTabDashboard(content)` gathers eight metrics in parallel: total users, total posts, active-today users, new-seven-day users, pending reports, banned users, pending verification requests, and pending ban appeals.

Each metric query is individually guarded and falls back to zero on failure. The dashboard waits for the aggregate result, maps the values into the eight metric cards, and renders safe zero values when all or some metrics fail. One failed metric does not prevent unrelated metrics from rendering.

## Harness coverage

`docs/admin-dashboard-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Normal dashboard | Aggregate all eight metrics in parallel | PASS |
| Metric mapping | Preserve fetched values for all cards | PASS |
| Partial failure | Failed metric becomes zero; others remain intact | PASS |
| All metrics fail | Render safe zero values | PASS |
| Render ordering | Render only after aggregate completion | PASS |

The harness is deterministic and uses mocked metric queries, aggregation, and rendering events only. It does not invoke real DOM, Supabase, authentication, admin authorization, profiles, reports, appeals, or account actions.

## Safe boundary

The protected `adminTabDashboard()` implementation and admin authorization/database boundaries remain inline and unchanged. No admin panel, moderation, metric, or account production code was moved or rewritten in this checkpoint.

## Validation

The standalone harness passed. The complete repository validation chain also passed, including all JavaScript syntax checks, HTML/script integration checks, every `/tmp/validate_*.py` contract validator, inline application-script syntax validation, whitespace checks, protected-function markers, script load order, Branch2 verification, and confirmation that `origin/main` remained unchanged.

## References

1. [`index.html` admin dashboard implementation](../index.html)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
