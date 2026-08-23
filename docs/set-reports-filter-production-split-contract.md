# NovaSocial `setReportsFilter` Production-Split Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-23  
**Purpose:** Define the narrow, reversible boundary for extracting the admin reports filter owner without moving report reads, report actions, notifications, moderation, or account state.

## Candidate boundary

`setReportsFilter(filter)` updates the existing `_reportsFilter` value, applies the selected filter’s existing color and border styling to the detached `rf-*` controls, resets the other controls, and delegates exactly one reload to the existing `loadReportsList()` owner.

The candidate owns no database query, report status update, notification, moderation, navigation, authentication, storage, or account operation. `adminTabReports()`, `loadReportsList()`, `showReportDetail()`, `adminResolveReport()`, `adminDismissReport()`, and all notification/moderation handlers remain inline and unchanged.

## Preparation status

| Gate | Required evidence | Status |
|---|---|---|
| Exact owner parity | Normalized owner matches immutable `origin/main` | PASS |
| Caller boundary | Four filter controls call the owner; reload remains delegated | PASS |
| Read-only classification | No database or state-changing operation is owned | PASS |
| Injected seam | Four filters plus missing-control behavior pass deterministically | PASS |
| Browser proof | Detached synthetic DOM only; no live admin action or query | PASS |
| Rollback | Pre-split Branch2 SHA and restoration procedure pinned | PASS |
| Production split | Anonymous classic global owner linked after its caller dependencies | Pending |
| Focused gates | Candidate and neighboring admin reports harnesses pass after split | Pending |
| Full regression | Clean pushed Branch2 tip after split | Pending |

## Safe boundary

Only the filter owner may move. The production split must preserve the classic-script global API as exactly one anonymous `window.setReportsFilter = function(filter) { ... }` assignment, with no ES-module conversion, `defer`, `async`, or live browser mutation.

## References

1. [`index.html`](../index.html)
2. [`admin-reports-tab-contract.md`](admin-reports-tab-contract.md)
3. [`set-reports-filter-production-split-contract-harness.js`](set-reports-filter-production-split-contract-harness.js)
4. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
