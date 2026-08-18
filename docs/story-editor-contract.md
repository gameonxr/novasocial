# NovaSocial Story Editor Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-18
**Purpose:** Record the fragile Story editor element-rendering and gesture invariants as a standalone contract before any future refactor.

## Contract

`renderStoryElements()` clears and rebuilds only the `#se-elements` container. Every editor element receives its stable `data-id`, percentage position, scale/rotation transform, drag cursor, touch-action, and short transition. The renderer preserves the distinct element types: text with font/color or gradient styling, stickers with text-sticker and emoji paths, polls with legacy `optionA`/`optionB` compatibility or modern `options[]`, multi-vote metadata, and the mention/location/hashtag/link fallback presentation.

Text elements retain the double-tap editing boundary. A text double-tap sets the editing element ID, copies the text into the editor input, restores font/color state, and opens the text tool. Non-text elements must not enter this text-edit path.

Touch and mouse dragging use the Story canvas dimensions to convert pointer deltas into percentage coordinates. Both axes are clamped to the 5–95 percent range, preventing elements from being dragged irretrievably off-canvas. Drag start disables the element transition and shows the delete zone. Drag end restores the transition and hides the delete zone.

When the release point is inside the delete zone, the element is removed from `storyEditorElements`, the editor is rendered again, and deletion feedback is shown. The delete-zone highlight is updated while dragging over the zone. Releasing elsewhere preserves the element’s bounded position and does not delete it.

## Harness coverage

`docs/story-editor-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Text rendering | Preserve content, font, gradient, position, scale, and rotation | PASS |
| Sticker rendering | Preserve text-sticker and emoji content paths | PASS |
| Poll rendering | Support options array, legacy options, layout, and multi-vote | PASS |
| Addon rendering | Preserve mention/location/hashtag/link fallback content | PASS |
| Drag bounds | Clamp both axes to 5–95 percent | PASS |
| Drag lifecycle | Show/hide delete zone and restore transition | PASS |
| Delete-zone release | Remove element, rerender, and show feedback | PASS |
| Text double-tap | Set editing state and open text tool | PASS |

The harness is deterministic and uses mocked element/state objects only. It does not invoke real DOM, touch/mouse events, editor UI, storage, authentication, database, or Story actions.

## Safe boundary

The protected `renderStoryElements()` implementation and Story editor constructor/state remain inline and unchanged. No Story editor production code was moved or rewritten in this checkpoint.

## Validation

The standalone harness passed. The complete repository validation chain also passed, including all JavaScript syntax checks, HTML/script integration checks, every `/tmp/validate_*.py` contract validator, inline application-script syntax validation, whitespace checks, protected-function markers, script load order, Branch2 verification, and confirmation that `origin/main` remained unchanged.

## References

1. [`index.html` Story editor rendering](../index.html)
2. [`CRITICAL_CONTEXT.md`](../../upload/CRITICAL_CONTEXT.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
