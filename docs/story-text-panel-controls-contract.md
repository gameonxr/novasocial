# NovaSocial Story Text-Panel Controls Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-25
**Purpose:** Record detached evidence for the isolated Story-editor text-panel opener and closer without executing text-element creation, editing, media, or publishing behavior.

## Contract

`seOpenTextTool()` shows the existing `se-text-panel`, focuses the existing `se-text-input`, and resets the local `seEditingTextId` to `null` for a new text entry. `seCloseTextPanel()` hides the existing text panel. These controls do not create or edit `storyEditorElements`, render the Story canvas, persist data, access media, upload content, or publish a Story.

This contract covers only the two already isolated text-panel controls. Text-element confirmation, editor-element mutation, canvas rendering, media processing, upload, persistence, account state, network/database access, and Story publishing remain outside this contract.

## Harness coverage

`docs/story-text-panel-controls-contract-harness.js` loads the two helpers in a detached VM with synthetic panel and focusable-input mocks. It verifies global availability, panel display transitions, focus invocation, new-entry editing-id reset, and zero text-element or external side effects.

| Scenario | Expected behavior | Result |
|---|---|---|
| Open control | Show the text panel, focus the input, and reset the editing id | PASS |
| Close control | Hide the text panel without changing text data | PASS |
| Focus behavior | Invoke focus exactly once on the existing input | PASS |
| Scope | Keep text creation/editing, canvas, media, upload, persistence, and publishing outside the controls | PASS |

## Safe boundary

The existing `src/features/se-open-text-tool.js` and `src/features/se-close-text-panel.js` modules remain unchanged. This checkpoint adds only detached evidence for local text-panel UI state. Text-element creation/editing, canvas rendering, media handling, persistence, account state, network/database access, and Story publishing remain untouched.

## Validation

The standalone harness must pass with the existing Story text/draw controls, Story-editor seam preparation, Story browser parity, protected-inline parity, contract-artifact pairing, the full Branch2 regression gate, and clean published-tip checks. This contract does not authorize modifying a real Story, opening media devices, uploading media, publishing content, or navigating a live application.

## References

1. [`se-open-text-tool.js`](../src/features/se-open-text-tool.js)
2. [`se-close-text-panel.js`](../src/features/se-close-text-panel.js)
3. [`story-text-controls-contract.md`](./story-text-controls-contract.md)
4. [`story-editor-seam-preparation-contract.md`](./story-editor-seam-preparation-contract.md)
5. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
