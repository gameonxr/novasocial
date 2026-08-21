# NovaSocial Show Report Modal Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the extracted report-modal renderer while preserving inline report persistence.

## Contract

`showReportModal(targetType, targetId)` closes the current modal, creates a `Report` modal, obtains its body, and renders the escaped target type together with the dynamic `REPORT_REASONS` list.

Each report reason preserves index and key data attributes, icon and label presentation, and hover background/border transitions. The Cancel action closes the modal. Mouse click and touchend handlers read the selected reason key and delegate to `submitReport(targetType, targetId, reasonKey)`; touch handling prevents the default action. Report persistence remains outside this module and inline.

The harness is static and documentation-only. It does not open a report modal, attach listeners, or submit a report.

## Harness coverage

`docs/show-report-modal-contract-harness.js` validates modal lifecycle, escaped target output, dynamic reason rendering, cancel action, hover transitions, mouse/touch delegation, default prevention, and inline persistence boundary.

## References

1. [`show-report-modal.js`](../src/features/show-report-modal.js)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

