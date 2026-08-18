# NovaSocial Admin Reports Tab Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-18
**Purpose:** Record the protected admin reports-tab filtering, enrichment, and rendering invariants before any future refactor.

## Contract

`adminTabReports(content)` renders the four report filters—pending, resolved, dismissed, and all—creates the reports-list loading state, and delegates the initial read to `loadReportsList()`.

`setReportsFilter(filter)` updates `_reportsFilter`, applies the selected filter’s color/style, resets the other filter controls, and reloads the list. `loadReportsList()` reads up to 100 reports in descending creation order. Every filter except `all` adds a status equality constraint; `all` omits that constraint.

For non-empty results, the loader groups target IDs by target type and enriches post, reel, comment, message, story, and user targets through parallel type-specific reads. It also enriches reporter and target-author identities through a profile lookup. Content previews are selected by target type, truncated where applicable, and safely escaped. Pending reports render view, resolve, and dismiss actions; non-pending reports render the view action only. Empty results and query failures render stable safe states.

The loader isolates failures in individual target-enrichment queries and continues rendering the report list. The report-tab renderer itself does not execute resolve, dismiss, notification, or moderation mutations.

## Harness coverage

`docs/admin-reports-tab-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Tab initialization | Four filters and list container render | PASS |
| Pending filter | Status equality query is applied | PASS |
| All filter | Status equality query is omitted | PASS |
| Filter styling | Selected filter receives expected styling | PASS |
| Target enrichment | Grouped post and profile lookups occur | PASS |
| Safe previews | Reasons and captions are escaped | PASS |
| Reporter rendering | Reporter identity is included | PASS |
| Pending actions | View, resolve, and dismiss actions render | PASS |
| Empty results | Filter-aware empty state renders | PASS |
| Query failure | Safe failure state renders | PASS |

The harness uses mocked DOM, database query builders, escaping, avatars, and timers only. It does not invoke real authentication, Supabase, report actions, notifications, content moderation, or account mutations.

## Safe boundary

The protected reports-tab functions and all report detail, resolve, dismiss, notification, and moderation handlers remain inline and unchanged. No production reports code was moved or rewritten in this checkpoint.

## Validation

The standalone harness passed. The complete repository validation chain must pass before this contract and harness are published to `docs/`.

## References

1. [`index.html` admin reports implementation](../index.html)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
