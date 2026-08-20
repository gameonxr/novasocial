# NovaSocial Hide FAB Button Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the structural invariants of the extracted floating-action-button hide helper.

## Contract

`hideFabButton()` resolves `#fab-main` and hides it when present. It stores `nova-fab-hidden=true` in local storage with exception tolerance, closes the FAB long-press menu, and shows `Upload shortcut hidden. Long press Home icon to restore.`

The helper owns FAB UI hiding, its local hidden-state marker, and menu cleanup only. Upload creation, navigation, account state, and protected post-creation behavior remain outside this module.

## Harness coverage

`docs/hide-fab-button-contract-harness.js` validates guarded lookup, display hiding, local marker handling, long-press cleanup, and toast feedback.

The harness is deterministic and static. It does not mutate DOM, local storage, menus, or upload state.

## Safe boundary

The extracted `src/features/hide-fab-button.js` module remains unchanged in this checkpoint. Protected upload and post-creation systems remain untouched.

## References

1. [`hide-fab-button.js`](../src/features/hide-fab-button.js)
2. [`restore-fab-button-contract.md`](./restore-fab-button-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

