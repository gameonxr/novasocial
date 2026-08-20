# NovaSocial Avatar Creator Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the structural invariants of the extracted Avatar Creator feature before any future implementation change.

## Contract

`showAvatarCreator()` opens the shared `modal()` surface with the Avatar Creator title, resolves `#mbody`, and renders the complete creator UI. The UI preserves the eight face-style choices, six background choices, six voice-style options, and Save Avatar button.

Face and background choices use local border-selection delegation, with the first choice selected by default. Save dispatches to `saveAvatar()`, which shows the existing confirmation toast and closes the modal. The feature is UI-only in this checkpoint: no avatar persistence, AI voice generation, comment mutation, story mutation, or remote request is owned here.

## Harness coverage

`docs/avatar-creator-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Modal entry | Use the shared Avatar Creator modal and `#mbody` | PASS |
| Face choices | Preserve eight selectable face styles and first-choice selection | PASS |
| Background choices | Preserve six selectable gradient backgrounds and first-choice selection | PASS |
| Voice choices | Preserve six voice-style options | PASS |
| Save flow | Preserve Save button dispatch to `saveAvatar()` | PASS |
| Save behavior | Preserve confirmation toast and modal cleanup | PASS |
| Scope | Keep persistence, network, AI voice, and content mutation outside module ownership | PASS |

The harness is deterministic and static. It does not open modals, mutate profile state, or invoke toast/UI callbacks.

## Safe boundary

The extracted `src/features/avatar-creator.js` module remains unchanged in this checkpoint. Persistence and high-risk media/content systems remain untouched.

## Validation

The standalone harness must pass with all JavaScript syntax checks, every current contract harness, `/tmp/validate_*.py` validators, inline-script validation, whitespace checks, and explicit Branch2/main reference checks.

## References

1. [`avatar-creator.js`](../src/features/avatar-creator.js)
2. [`avatar-action-sheet-contract.md`](./avatar-action-sheet-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

