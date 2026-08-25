# Protected Stories lifecycle, editor, viewer, playback, polls, replies, and deletion — Protected Readiness Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-25
**Status:** `PREPARATION_ONLY`; production extraction remains `BLOCKED` until every gate below is independently approved.

## Scope and protected boundary

This dossier covers story creation/editor state, canvas overlays, viewer playback, viewers/reactions/polls/replies, submission, deletion, media cleanup, and lifecycle navigation. It is a system-level preparation artifact, not a duplicate one-owner extraction contract. Existing helper-level contracts remain authoritative for already-approved owners and are not weakened by this document.

## Dependency map

canvas/editor state, overlay serialization, story viewer/playback timers, story_views, poll votes/results, replies, reactions, media URLs, submission/deletion paths, and viewer navigation stack.

Protected source markers used by the detached inventory harness:
- `function renderStoryElements()`
- `voteStoryPoll(`

## Exact before/after parity boundary

Before/after must preserve canvas/editor persistence, overlay ordering, playback timing, pause/resume, viewer indexing, poll selection/results, reply input, viewers/reactions, submission/deletion authorization, media cleanup, and navigation cleanup. No editor or viewer state may be split independently without a complete lifecycle map.

The parity comparison must use the immutable `origin/main` baseline and the Branch2 candidate snapshot. Any changed query, event, timer, global assignment, DOM mutation, storage key, media call, permission request, navigation transition, or cleanup sequence is a parity failure until explicitly authorized.

## Detached/browser-safe proof plan

Use detached canvas/DOM/media/timer/DB mocks for empty/loading/error, playback pause/resume, poll success/failure, reply success/failure, viewer exit, editor undo/history, submission, deletion, and media-cleanup failure. Browser-safe proof must be non-destructive and must not publish/delete live Stories.

Required evidence is synthetic and detached. A mock result is not production approval. Browser-safe evidence must record the shell state, mocked dependencies, expected events, forbidden side effects, and cleanup result without using a real account or live mutation.

## Rollback artifact

Pin editor/viewer owner hashes and all lifecycle script boundaries; rollback restores the inline owners and removes only the new linkage. Preserve a pre-split synthetic trace and run Story/canvas/media/protected gates after rollback.

The rollback artifact must pin the pre-split commit, source owner hash, script insertion/removal boundary, and post-rollback gate results. No production extraction is eligible without this artifact.

## Explicit feature authorization

Explicit authorization must define which Story lifecycle segment may move, canvas/editor ownership, viewer timing, poll/reply/submission/deletion semantics, media cleanup, privacy rules, and rollback authority.

Authorization must be written against this exact system boundary. Authorization for a helper, control, or preparation harness does not authorize the protected system itself.

## Decision and non-goals

`EXACT_BEFORE_AFTER_PARITY=REQUIRED`
`DETACHED_BROWSER_SAFE_PROOF=REQUIRED`
`ROLLBACK_ARTIFACT=REQUIRED`
`EXPLICIT_FEATURE_AUTHORIZATION=REQUIRED`
`PRODUCTION_DECISION=BLOCKED`
`PRODUCTION_CHANGE=0`
`LIVE_SIDE_EFFECTS=0`
`BROWSER_LIVE_ACTIONS=0`

This dossier does not move code, change schema, authenticate, request permissions, upload media, send messages, mutate accounts, perform moderation, or alter protected accounting. It records what must be proven before a future minimal split can be considered.

## References

1. [`high-risk-seam-readiness-matrix-contract.md`](./high-risk-seam-readiness-matrix-contract.md)
2. [`protected-inline-parity-contract.md`](./protected-inline-parity-contract.md)
3. [`reversible-browser-proof-contract.md`](./reversible-browser-proof-contract.md)
4. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
