# NovaSocial Story Background Controls Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-25
**Purpose:** Record detached evidence for the isolated Story-editor background panel and gradient selector without executing Story persistence, media, or publishing behavior.

## Contract

`seOpenBgTool()` shows the existing `se-bg-panel`, and `seCloseBgPanel()` hides it. `seSelectBg(gradient, idx)` assigns the local `storyEditorBg`, applies the selected gradient to `se-bg-overlay`, resets all `.se-bg-opt` borders, highlights only the indexed option, and closes the background panel.

This contract covers only the local background-control UI already isolated in `src/features/story-background-helpers.js`. Story-element creation or editing, canvas rendering, media processing, upload, persistence, account state, network/database access, and Story publishing remain outside this contract.

## Harness coverage

`docs/story-background-controls-contract-harness.js` loads the helper in a detached VM with synthetic panel, overlay, and background-option mocks. It verifies global availability, panel display transitions, local background assignment, overlay gradient styling, selected/inactive option borders, automatic panel close after selection, and zero persistence or external side effects.

| Scenario | Expected behavior | Result |
|---|---|---|
| Open control | Show the background panel | PASS |
| Close control | Hide the background panel | PASS |
| Background selection | Set local gradient state and apply it to the overlay | PASS |
| Option styling | Highlight only the selected background option | PASS |
| Selection cleanup | Close the panel after selecting a background | PASS |
| Scope | Keep Story elements, canvas, media, upload, persistence, and publishing outside the controls | PASS |

## Safe boundary

The existing `src/features/story-background-helpers.js` module remains unchanged. This checkpoint adds only detached evidence for local background-control UI state. Story-element editing, canvas rendering, media handling, persistence, account state, network/database access, and Story publishing remain untouched.

## Validation

The standalone harness must pass with the existing Story text/draw controls, Story-editor seam preparation, Story browser parity, protected-inline parity, contract-artifact pairing, the full Branch2 regression gate, and clean published-tip checks. This contract does not authorize modifying a real Story, drawing on a real canvas, uploading media, publishing content, or navigating a live application.

## References

1. [`story-background-helpers.js`](../src/features/story-background-helpers.js)
2. [`story-text-controls-contract.md`](./story-text-controls-contract.md)
3. [`story-draw-controls-contract.md`](./story-draw-controls-contract.md)
4. [`story-editor-seam-preparation-contract.md`](./story-editor-seam-preparation-contract.md)
5. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
