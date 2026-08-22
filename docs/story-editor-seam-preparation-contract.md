# NovaSocial Story Editor Seam Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-22  
**Purpose:** Record the completed reversible split of the protected Story editor element renderer.

## Preparation map

| Boundary | Current protected owner | Required seam input |
|---|---|---|
| Element collection | Inline `storyEditorElements` state and `renderStoryElements()` | Adapter preserving element order, stable IDs, and the current container-only rerender |
| Visual models | Inline DOM creation for text, sticker, poll, mention, location, hashtag, and link elements | Renderer seam preserving content fallbacks, typography, gradient, position, scale, rotation, cursor, touch-action, and transition |
| Text editing | Inline text double-tap handler and editor input/font/color state | Callback seam preserving text-only editing and rejecting non-text elements |
| Drag lifecycle | Inline touch/mouse handlers, canvas dimensions, and delete-zone state | Event seam preserving percentage conversion, 5–95 bounds, transition restoration, delete-zone feedback, and rerender-on-delete |
| Persistence boundary | `publishStoryEditor()` and Story database/media paths | Keep publishing, uploads, notifications, and overlays outside renderer ownership |
| Cross-feature state | Story editor constructor, drawing canvas, music, and undo state | Do not move constructor, publishing, drawing, music, or undo ownership speculatively |

## Gate status

The split is complete. `renderStoryElements()` now lives in `src/features/story-editor-owners.js` as the single anonymous `window.renderStoryElements` owner; Story editor state, drag/delete-zone helpers, and the publishing path remain inline and unchanged. Synthetic browser-context parity and detached rollback evidence pass. No real DOM account, storage, media, authentication, upload, publishing, or user action was performed.

## Harness coverage

`docs/story-editor-seam-preparation-contract-harness.js` verifies the renderer is absent from inline HTML, has one window-assigned module owner, the existing Story editor contract and harness are paired, publishing remains a separate boundary, and the synthetic browser parity harness is available. `docs/story-editor-browser-parity-harness.js` executes the owner against mocked DOM/state objects only.

| Check | Expected behavior | Result |
|---|---:|---|
| Renderer owner | One anonymous `window.renderStoryElements` owner in `src/features/story-editor-owners.js` | PASS |
| State boundary | `storyEditorElements` and `#se-elements` remain visible | PASS |
| Interaction boundary | Drag, delete-zone, and text-edit markers remain present | PASS |
| Persistence boundary | `publishStoryEditor()` remains separate | PASS |
| Contract pairing | Story editor contract and harness exist | PASS |
| Production split | Completed; inline owner removed and script loaded | PASS |

## References

1. [`story-editor-contract.md`](./story-editor-contract.md)
2. [`story-editor-contract-harness.js`](./story-editor-contract-harness.js)
3. [`index.html`](../index.html)
4. [`story-editor-browser-parity-harness.js`](./story-editor-browser-parity-harness.js)
5. [`story-editor-rollback-evidence.txt`](./story-editor-rollback-evidence.txt)
6. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

