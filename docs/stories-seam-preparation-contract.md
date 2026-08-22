# NovaSocial Stories Seam-Preparation Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Prepare, but do not execute, a reversible seam for the protected Stories system.

## Preparation map

| Boundary | Current protected owner | Required seam input |
|---|---|---|
| Story selection/grouping | Inline `openSV()` and `svData` bucket/index state | Adapter preserving user-bucket grouping, story order, requested-story selection, and navigation-stack entry |
| Story rendering | Inline `renderStoryElements()`/`renderSV()` | Render adapter preserving media teardown, progress bars, image-load timer, video readiness/timeupdate/ended/error paths, overlays, and gesture wiring |
| Playback/navigation | Inline next/previous story/user handlers and `closeSV()` | State transition seam preserving bucket boundaries, timer/media cleanup, gesture thresholds, and close-stack behavior |
| Owner viewers | Inline `showStoryViewers()` and owner-only upward swipe path | Modal seam preserving pause/clear/pause-all lifecycle, loading/empty/error states, profile navigation, and playback resume |
| Poll interaction | Inline `voteStoryPoll()`, `refreshPollResults()`, `loadStoryPollState()` | Poll adapter preserving single/multi-vote state, best-effort persistence, valid-index counting, fallback results, and prior-state restoration |
| Replies/reactions | Inline Story reply/reaction controls | Interaction seam preserving current-user guards, reply navigation, reaction persistence, and local UI refresh |
| Story data/submission | Inline Story load/submission/deletion boundaries | Data seam preserving account guards, expiry/deletion behavior, source ordering, and non-destructive failure handling |

## Gate status

This is a **mapping-only checkpoint**. Story viewer, playback, viewers-list, poll, reply/reaction, submission, and deletion implementations remain inline. Two non-destructive browser-context mock artifacts now cover empty-data guarding and synthetic-image setup. They prove reversible mock behavior only and are not permission to extract production code. Before a split, the project still needs an explicit adapter seam, protected before/after marker parity, and reversible browser proof for the production split itself, covering bucket transitions, media lifecycle, gestures, owner viewers, poll persistence/fallback, replies/reactions, and cleanup.

The first implementation step must be test-only or adapter-only and must preserve `openSV()`, `renderStoryElements()`, `voteStoryPoll()`, `refreshPollResults()`, and `loadStoryPollState()` owners until the complete seam harness passes.

## Harness coverage

`docs/stories-seam-preparation-contract-harness.js` scans `index.html` and `src/` to confirm protected Story signatures and dependency markers, the existing Story behavior contracts/harnesses, the two passing non-destructive browser mock artifacts, and zero matching protected signatures in extracted modules. It does not open media, query Supabase, mutate polls, navigate profiles, or move production code.

| Check | Expected behavior | Result |
|---|---:|---|
| Viewer/navigation owner | Story viewer functions remain inline | PASS |
| Poll owners | Poll vote/result/state functions remain inline | PASS |
| Playback/viewers | Media, timer, owner-viewers, and modal markers remain present | PASS |
| Existing behavior locks | Viewer, poll, viewers-list, reply/reaction, submission, deletion contracts remain present | PASS |
| Browser mock inventory | Empty-data and synthetic-image setup artifacts are present with PASS markers | PASS |
| Production split | None | PASS |

## References

1. [`story-viewer-contract.md`](./story-viewer-contract.md)
2. [`story-poll-contract.md`](./story-poll-contract.md)
3. [`story-viewers-list-contract.md`](./story-viewers-list-contract.md)
4. [`story-reply-reaction-contract.md`](./story-reply-reaction-contract.md)
5. [`story-submission-contract.md`](./story-submission-contract.md)
6. [`story-deletion-contract.md`](./story-deletion-contract.md)
7. [`index.html`](../index.html)
8. [`stories-empty-data-browser-proof-evidence.txt`](./stories-empty-data-browser-proof-evidence.txt)
9. [`stories-image-setup-browser-proof-evidence.txt`](./stories-image-setup-browser-proof-evidence.txt)
10. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

