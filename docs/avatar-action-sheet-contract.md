# NovaSocial Avatar Action Sheet Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the extracted avatar action-sheet invariants before any further structural change.

## Contract

`showAvatarActionSheet()` removes any existing sheet before creating a fresh full-screen `avatar-action-sheet` overlay. The sheet conditionally renders View Photo only when `PROF?.avatar_url` exists, delegates viewing to `viewAvatarFullscreen` with the current avatar and escaped username, delegates Change Photo to the hidden `avpick` input after removing the sheet, and preserves Cancel removal.

Backdrop clicks remove the sheet only when the event target is the backdrop itself. The renderer owns only the action-sheet surface and cleanup; avatar viewing and file processing remain outside this module.

## Harness coverage

`docs/avatar-action-sheet-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Replacement | Remove an existing sheet before creating another | PASS |
| Surface | Preserve full-screen `avatar-action-sheet` overlay | PASS |
| Conditional view | Render View Photo only with an avatar URL | PASS |
| View dispatch | Preserve avatar, escaped username, and fullscreen delegation | PASS |
| Change dispatch | Remove sheet and trigger `avpick` | PASS |
| Cancel | Remove sheet without side effects | PASS |
| Backdrop | Remove only when the backdrop is clicked | PASS |
| Scope | Keep viewing and upload processing outside renderer ownership | PASS |

The harness is deterministic and static. It does not create DOM nodes, open avatar viewers, or trigger file pickers.

## Safe boundary

The extracted `src/features/avatar-action-sheet.js` module remains unchanged in this checkpoint. Profile data, avatar upload, and fullscreen viewing systems remain unchanged.

## Validation

The standalone harness must pass with all JavaScript syntax checks, every current contract harness, `/tmp/validate_*.py` validators, inline-script validation, whitespace checks, and explicit Branch2/main reference checks.

## References

1. [`avatar-action-sheet.js`](../src/features/avatar-action-sheet.js)
2. [`profile-customizer-contract.md`](./profile-customizer-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

