# NovaSocial Select Note Visibility Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the structural invariants of the extracted note-visibility UI state helper.

## Contract

`selectNoteVisibility(v)` assigns `window._noteVisibility`, iterates the `everyone`, `followers`, and `close_friends` options, and applies selected or unselected background, text color, and border color to each existing option element.

The helper owns visibility-selection UI state only. Note persistence, audience enforcement, music, and note creation remain outside this module.

## Harness coverage

`docs/select-note-visibility-contract-harness.js` validates global state assignment, option coverage, missing-element safety, selected/unselected style branches, and UI-only scope.

The harness is deterministic and static. It does not mutate DOM, persist notes, or create content.

## Safe boundary

The extracted `src/features/select-note-visibility.js` module remains unchanged in this checkpoint. Protected note persistence and music systems remain untouched.

## References

1. [`select-note-visibility.js`](../src/features/select-note-visibility.js)
2. [`note-visibility-contract.md`](./note-visibility-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

