# NovaSocial Refresh and Open Note Creator Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the extracted note refresh orchestration helper.

## Contract

`refreshAndOpenNoteCreator()` queries `quick_notes` through the existing `db` client, selects all columns, filters by `ME.id`, requires `expires_at` to be later than the current ISO timestamp, orders by `created_at` descending, limits the result to one row, and uses `maybeSingle()`.

It logs the existing diagnostic message, assigns the returned `latestNote` to `_myActiveNote`, and schedules `openNoteCreator()` after the existing 200-millisecond delay. The helper owns refresh-to-composer orchestration only; note persistence, deletion, rendering, and database client configuration remain outside this module.

The harness intentionally does not connect to Supabase, use a logged-in account, or alter note data. Existing query and timing behavior are documented rather than changed.

## Harness coverage

`docs/refresh-and-open-note-creator-contract-harness.js` validates the function signature, query table/selection/filter/order/limit/single-row markers, diagnostic logging, active-note assignment, delayed creator opening, and protected ownership boundaries.

## References

1. [`refresh-and-open-note-creator.js`](../src/features/refresh-and-open-note-creator.js)
2. [`open-note-creator.js`](../src/features/open-note-creator.js)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

