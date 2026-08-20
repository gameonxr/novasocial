# NovaSocial Close Crop Preview Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the structural invariants of the extracted crop-preview cleanup helper.

## Contract

`closeCropPreview()` removes `#nova-crop-modal` through optional cleanup and resets `_cropState` to the complete default state: no file or image element, unit scale/minimum scale, zero offsets and drag origin, inactive dragging, `avatar` crop type, and no confirmation callback.

The helper owns cleanup and state reset only. Crop rendering, gesture handling, confirmation, avatar upload, and media processing remain outside this module.

## Harness coverage

`docs/close-crop-preview-contract-harness.js` validates modal removal, complete state-reset fields, default crop type, callback clearing, and cleanup-only scope.

The harness is deterministic and static. It does not mutate DOM, crop state, files, or avatar data.

## Safe boundary

The extracted `src/features/close-crop-preview.js` module remains unchanged in this checkpoint. Crop processing and avatar upload systems remain untouched.

## References

1. [`close-crop-preview.js`](../src/features/close-crop-preview.js)
2. [`avatar-action-sheet-contract.md`](./avatar-action-sheet-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

