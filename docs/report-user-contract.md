# NovaSocial Report User Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariant of the extracted user-report UI wrapper.

## Contract

`reportUser(userId)` is a thin UI wrapper. It delegates exactly once to `showReportModal('user', userId)`, preserving the supplied user identifier and selecting the user target type.

The module does not query data, submit a report, mutate application state, or own the report modal implementation. The modal and any eventual report submission remain owned by their existing systems.

The harness is static and documentation-only. It does not open a modal or submit a user report.

## Harness coverage

`docs/report-user-contract-harness.js` validates the function signature, exact user target type, argument forwarding, single delegation, and the absence of unrelated network or modal implementation ownership.

## References

1. [`report-user.js`](../src/features/report-user.js)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

