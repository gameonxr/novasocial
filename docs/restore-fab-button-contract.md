# NovaSocial Restore FAB Button Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the structural invariants of the extracted floating-action-button restore helper.

## Contract

`restoreFabButton()` resolves `#fab-main` and safely does nothing when absent. When present, it restores flex display, applies the `novaScaleIn 0.4s ease` animation, writes `nova-fab-hidden=false` to local storage with exception tolerance, preserves the Home-tab display condition, and shows `Upload Button Restored`.

The helper owns FAB UI restoration and its local hidden-state marker only. Upload creation, navigation, persistence beyond this marker, and protected posting behavior remain outside this module.

## Harness coverage

`docs/restore-fab-button-contract-harness.js` validates guarded lookup, display/animation restoration, local marker handling, Home-tab condition, and toast feedback.

The harness is deterministic and static. It does not mutate DOM, local storage, or upload state.

## Safe boundary

The extracted `src/features/restore-fab-button.js` module remains unchanged in this checkpoint. Protected upload and post-creation systems remain untouched.

## References

1. [`restore-fab-button.js`](../src/features/restore-fab-button.js)
2. [`hide-fab-button-contract.md`](./hide-fab-button-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

