# NovaSocial Story Viewers-List Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-18
**Purpose:** Record the protected Story viewers-list modal and playback lifecycle invariants as a standalone contract before any future refactor.

## Contract

`showStoryViewers(storyId)` pauses Story playback, marks the viewer paused, clears the Story timer, and pauses all active videos before creating the high-priority viewers modal. The modal initially renders a loading state while querying `story_views` joined to viewer profiles.

An empty or missing viewer result renders the explicit `No views yet.` state. Existing viewer profiles render as clickable rows. Closing the modal through its close control or backdrop removes the modal and resumes Story playback. Selecting a viewer removes the modal, closes the Story viewer, and opens that viewer’s profile. A query failure leaves the modal in its paused/error state rather than inventing viewer rows or reporting false data.

## Harness coverage

`docs/story-viewers-list-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Modal start | Pause Story, clear timer, pause videos | PASS |
| Modal loading | Create modal and show loading state | PASS |
| Existing viewers | Render viewer rows | PASS |
| Empty viewers | Render `No views yet.` state | PASS |
| Query failure | Remain non-destructive without fake rows | PASS |
| Modal close/backdrop | Resume Story playback | PASS |
| Viewer row click | Remove modal, close Story, open profile | PASS |
| Injected modal dispatch | Viewers-list dependency dispatches explicitly and preserves row rendering/resume behavior | PASS |

The harness is deterministic and uses mocked playback, timer, query, modal, and navigation events only. Its injected modal dispatcher is test-only and is not loaded by `index.html`. It does not invoke real DOM, Supabase, Story playback, authentication, profiles, or account actions.

## Safe boundary

The protected `showStoryViewers()` implementation and Story viewer/playback boundaries remain inline and unchanged. No Story viewers modal, playback, database, or profile production code was moved or rewritten in this checkpoint.

## Validation

The standalone harness passed. The complete repository validation chain also passed, including all JavaScript syntax checks, HTML/script integration checks, every `/tmp/validate_*.py` contract validator, inline application-script syntax validation, whitespace checks, protected-function markers, script load order, Branch2 verification, and confirmation that `origin/main` remained unchanged.

## References

1. [`index.html` Story viewers-list implementation](../index.html)
2. [`CRITICAL_CONTEXT.md`](../../upload/CRITICAL_CONTEXT.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
