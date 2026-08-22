# NovaSocial Story Editor Seam-Preparation Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-22  
**Purpose:** Prepare, but do not execute, a reversible seam for the protected Story editor element renderer.

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

This is a **mapping-only checkpoint**. The protected `renderStoryElements()` implementation, Story editor state, drag handlers, delete-zone helpers, and publishing path remain inline and unchanged. The preparation harness proves the renderer markers, behavior-contract pairing, persistence boundary, and zero production split. It does not create DOM nodes, trigger touch/mouse events, access storage, authenticate, upload media, publish stories, or mutate account data.

Before any production split, the project still needs an explicit adapter seam, before/after marker parity, browser-context proof using synthetic DOM/state mocks, and detached rollback evidence covering every supported element type, text editing, drag bounds, delete-zone deletion, and rerender behavior.

## Harness coverage

`docs/story-editor-seam-preparation-contract-harness.js` statically verifies the protected renderer and state markers remain inline, the existing Story editor contract and harness are paired, publishing remains a separate boundary, and no Story editor production module has been introduced.

| Check | Expected behavior | Result |
|---|---:|---|
| Renderer owner | `renderStoryElements()` remains inline | PASS |
| State boundary | `storyEditorElements` and `#se-elements` remain visible | PASS |
| Interaction boundary | Drag, delete-zone, and text-edit markers remain present | PASS |
| Persistence boundary | `publishStoryEditor()` remains separate | PASS |
| Contract pairing | Story editor contract and harness exist | PASS |
| Production split | None | PASS |

## References

1. [`story-editor-contract.md`](./story-editor-contract.md)
2. [`story-editor-contract-harness.js`](./story-editor-contract-harness.js)
3. [`index.html`](../index.html)
4. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

