# NovaSocial Story Draw Controls Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-25
**Purpose:** Record detached evidence for the isolated Story-editor draw-panel and draw-type UI controls without executing drawing, canvas-history, media, or publishing behavior.

## Contract

The `seOpenDrawTool()` and `seCloseDrawPanel()` helpers control only the existing draw-panel display, the local `storyEditorDrawMode` flag, and the Story-editor canvas pointer-events style. `seSelectDrawType(type)` assigns the local `storyEditorDrawType` value and updates the synthetic `.se-draw-type` option styles so the selected type uses the active gradient/white styling and other options use the inactive dark/gray styling.

This contract covers only these three already isolated draw-control helpers. Canvas drawing, undo history, bitmap mutation, media processing, upload, persistence, account state, network/database access, and Story publishing remain outside this contract.

## Harness coverage

`docs/story-draw-controls-contract-harness.js` loads the three helpers in a detached VM with synthetic panel, canvas, and draw-type option mocks. It verifies global availability, open/close panel state, draw-mode and pointer-events transitions, selected/inactive draw-type styling, missing-panel tolerance for the panel controls, and zero canvas-history or external side effects.

| Scenario | Expected behavior | Result |
|---|---|---|
| Open control | Show the draw panel, enable draw mode, and enable canvas pointer events | PASS |
| Close control | Hide the draw panel, disable draw mode, and disable canvas pointer events | PASS |
| Draw-type selection | Set the local type and style only the matching option as selected | PASS |
| Missing panel | Preserve the existing helper behavior without external effects | PASS |
| Scope | Keep drawing, undo history, bitmap, media, upload, persistence, and publishing outside the controls | PASS |

## Safe boundary

The existing `src/features/se-open-draw-tool.js`, `src/features/se-close-draw-panel.js`, and `src/features/se-select-draw-type.js` modules remain unchanged. This checkpoint adds only detached evidence for local draw-control UI state. Canvas drawing and history, media handling, persistence, account state, network/database access, and Story publishing remain untouched.

## Validation

The standalone harness must pass with the existing Story-editor seam preparation, Story browser parity, protected-inline parity, contract-artifact pairing, the full Branch2 regression gate, and clean published-tip checks. This contract does not authorize opening media devices, drawing on a real canvas, modifying a real Story, uploading media, publishing content, or navigating a live application.

## References

1. [`se-open-draw-tool.js`](../src/features/se-open-draw-tool.js)
2. [`se-close-draw-panel.js`](../src/features/se-close-draw-panel.js)
3. [`se-select-draw-type.js`](../src/features/se-select-draw-type.js)
4. [`story-editor-seam-preparation-contract.md`](./story-editor-seam-preparation-contract.md)
5. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
