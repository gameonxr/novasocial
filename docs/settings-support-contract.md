# NovaSocial Settings Support Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the extracted Support settings renderer.

## Contract

`showSettingsSupport()` creates a `Support` modal and writes the settings body through the modal body element. It renders six `.nova-setting-row` entries: Ask Nova AI, Help Center, Report Problem, Terms of Service, Privacy Policy, and About NovaSocial.

Ask Nova AI closes the modal and delegates to `toggleNovaAI()`. Help Center delegates to `showHelpCenter()`, Report Problem delegates to `showReportProblem()`, and About NovaSocial delegates to `showAbout()`. Terms of Service and Privacy Policy provide toast-only informational feedback. Support presentation does not own AI, help-center, reporting, legal-content, or persistence behavior.

The harness is static and documentation-only. It does not open the Support modal or trigger any delegate.

## Harness coverage

`docs/settings-support-contract-harness.js` validates the modal title, body rendering, six-row layout, visible labels, exact delegate markers, toast-only policy rows, and scope boundaries.

## References

1. [`settings-support.js`](../src/features/settings-support.js)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

