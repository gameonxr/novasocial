# NovaSocial Confirmation Dialog Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-18
**Purpose:** Record the extracted confirmation-dialog defaults, interaction, focus, and cleanup invariants as a standalone contract before any future refactor.

## Contract

`showConfirmDialog(message, options)` creates an overlay and companion style block, applies defaults for title, confirm label, cancel label, and destructive styling, and appends both elements to the document. The confirm button receives focus when available.

Confirm-button activation resolves `true`; cancel-button activation and tapping outside the dialog card resolve `false`. Every resolution removes both the overlay and the injected style block before resolving, preventing stale modal/style elements.

The danger option defaults to `true`; passing `danger: false` selects the non-destructive confirm styling. Custom title and button labels are preserved.

## Harness coverage

`docs/confirm-dialog-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Default dialog | Use default title, labels, and danger styling | PASS |
| Custom destructive dialog | Preserve custom title/labels and danger style | PASS |
| Custom safe dialog | Preserve `danger: false` and custom confirm label | PASS |
| Confirm action | Resolve `true` | PASS |
| Cancel action | Resolve `false` | PASS |
| Overlay-tap cancellation | Resolve `false` | PASS |
| Resolution cleanup | Remove overlay and injected style | PASS |
| Focus | Focus confirm control when available | PASS |

The harness is deterministic and uses mocked dialog, style, focus, cleanup, and resolution events only. It does not invoke real DOM, authentication, Supabase, profile, block, delete, or account actions.

## Safe boundary

The extracted `showConfirmDialog()` utility remains unchanged. No modal, confirmation, block, delete, moderation, or account production code was rewritten in this checkpoint.

## Validation

The standalone harness passed. The complete repository validation chain also passed, including all JavaScript syntax checks, HTML/script integration checks, every `/tmp/validate_*.py` contract validator, inline application-script syntax validation, whitespace checks, protected-function markers, script load order, Branch2 verification, and confirmation that `origin/main` remained unchanged.

## References

1. [`src/core/utils.js` confirmation dialog utility](../src/core/utils.js)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
