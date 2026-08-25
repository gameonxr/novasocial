# NovaSocial Story Text Controls Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-25
**Purpose:** Record detached evidence for the isolated Story-editor text color, font, and gradient UI controls without executing text-element persistence, media, or publishing behavior.

## Contract

`seSelectTextColor(c)` assigns the local `seCurrentTextColor`, disables gradient mode, clears existing `.se-color-opt` borders, and highlights the event target. `seSelectFont(idx)` assigns the local `seCurrentFont` and applies active gradient/white or inactive dark/gray styling across `.se-font-opt` options. `seToggleGradientText()` toggles the local `seGradientText` flag and shows the existing toast only when gradient mode becomes enabled.

This contract covers only these three already isolated text-control helpers. Text-element creation or editing, `storyEditorElements` mutation, canvas rendering, media processing, upload, persistence, account state, network/database access, and Story publishing remain outside this contract.

## Harness coverage

`docs/story-text-controls-contract-harness.js` loads the three helpers in a detached VM with synthetic color/font option, event-target, and toast mocks. It verifies global availability, color assignment and gradient reset, color-border styling, font assignment and option styling, both gradient toggle directions, toast behavior, and zero text-persistence or external side effects.

| Scenario | Expected behavior | Result |
|---|---|---|
| Text color selection | Set local color, disable gradient mode, and highlight only the event target | PASS |
| Font selection | Set local font and style the selected option separately from inactive options | PASS |
| Gradient enable | Toggle local gradient state on and show the existing toast | PASS |
| Gradient disable | Toggle local gradient state off without an enable toast | PASS |
| Scope | Keep text-element mutation, canvas, media, upload, persistence, and publishing outside the controls | PASS |

## Safe boundary

The existing `src/features/se-select-text-color.js`, `src/features/se-select-font.js`, and `src/features/se-toggle-gradient-text.js` modules remain unchanged. This checkpoint adds only detached evidence for local text-control UI state. Text-element creation/editing, canvas rendering, media handling, persistence, account state, network/database access, and Story publishing remain untouched.

## Validation

The standalone harness must pass with the existing Story draw-controls contract, Story-editor seam preparation, Story browser parity, protected-inline parity, contract-artifact pairing, the full Branch2 regression gate, and clean published-tip checks. This contract does not authorize modifying a real Story, drawing on a real canvas, uploading media, publishing content, or navigating a live application.

## References

1. [`se-select-text-color.js`](../src/features/se-select-text-color.js)
2. [`se-select-font.js`](../src/features/se-select-font.js)
3. [`se-toggle-gradient-text.js`](../src/features/se-toggle-gradient-text.js)
4. [`story-draw-controls-contract.md`](./story-draw-controls-contract.md)
5. [`story-editor-seam-preparation-contract.md`](./story-editor-seam-preparation-contract.md)
6. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
