# NovaSocial Toggle Ghost Mode Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the extracted Ghost Mode profile-preference helper without changing account state.

## Contract

`toggleGhostMode()` derives `newMode` as the inverse of `PROF?.ghost_mode || false`, persists that value to the current profile through the existing `db` update, synchronizes `PROF.ghost_mode`, updates `#ghost-status` to ON or OFF text with the corresponding indicator, and emits the matching activation or deactivation toast.

The helper owns only the Ghost Mode preference transition. The harness is static and documentation-only; it does not update a profile, access the database, or alter the UI.

## Harness coverage

`docs/toggle-ghost-mode-contract-harness.js` validates signature, safe default inversion, profile update field and identity, local state synchronization, status text, and both toast branches.

## References

1. [`toggle-ghost-mode.js`](../src/features/toggle-ghost-mode.js)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

