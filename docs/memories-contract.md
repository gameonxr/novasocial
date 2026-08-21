# NovaSocial Memories Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the extracted Memories feature without querying or displaying user posts.

## Contract

`showMemories()` renders a loading state, computes a one-year-ago start date and a seven-day end date, and queries the current user’s posts with profile metadata between those timestamps, ordered newest first and capped at 10.

It derives a same-day/month view from the loaded memories, renders the Memories screen with On This Day framing, a Mood navigation action, and either the no-memory state or post cards with profile, date, one-year label, optional media, and truncated caption. Cards delegate to `viewPost(id)`. The AI Memory Timeline text remains display-only. Query or rendering failures produce the existing Hindi error state.

The harness is static and documentation-only. It does not query posts, render media, open a post, or open the mood timeline.

## Harness coverage

`docs/memories-contract-harness.js` validates loading state, one-year and seven-day date calculations, user-post query fields/order/cap, same-day filtering, empty/error states, media/caption rendering, viewPost routing, and mood-timeline delegation.

## References

1. [`memories.js`](../src/features/memories.js)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

