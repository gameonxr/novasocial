# Notes Reaction Owner — Independent Proof Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-25
**Status:** `INDEPENDENT_PROOF_PREPARATION`; production extraction remains `BLOCKED`.

## Candidate boundary

The candidate is the bounded inline `function reactToNote(noteId, emoji, clickedEl)` owner at `index.html:10703–10725`. It covers reaction-button visual feedback, synthetic burst animation, toast feedback, one reaction upsert, and successful refresh through `loadNotesBar()`.

The candidate excludes Note creation/update, editor state, media/music attachments, visibility controls, note expiry, Note viewer audio, reactor-list loading, navigation, realtime subscription setup, and all unrelated Note lifecycle behavior.

## Exact parity boundary

The independent harness extracts the owner from current Branch2 and immutable `origin/main`, normalizes only line endings, and compares the exact owner body. The owner hash is pinned in `notes-reaction-owner-independent-proof-rollback-evidence.txt`. Any owner-body change fails parity.

## Detached proof matrix

The proof executes the unchanged owner with synthetic DOM, animation-frame, timer, navigator, toast, read-only account, and database-upsert mocks. It covers successful upsert with a clicked element, successful upsert without a clicked element, and database-error rollback behavior. It verifies visual reset/feedback, burst cleanup, toast ordering, exact payload/options, success-only `loadNotesBar()`, and zero forbidden live effects.

| Gate | Requirement |
|---|---|
| Exact origin parity | Current owner equals immutable-origin owner |
| Success path | One upsert with exact `note_id`, `user_id`, and `emoji`; success refresh occurs once |
| Missing clicked element | Reaction persists without throwing or creating an invalid DOM dependency |
| Error path | Error toast occurs and success refresh does not occur |
| Timing and cleanup | Animation frame and 200ms/700ms timers complete; burst is removed and button transform resets |
| Side-effect policy | No network, storage, account mutation outside mocked upsert, permission, media, realtime, or live navigation |

## Authorization boundary

This contract authorizes detached independent proof only. It does not authorize production extraction or any live Note reaction. A future extraction would require a new explicit production authorization, actual controlled non-production split, post-split parity, rollback-after-split, and full Branch2 regression.

## Decision

`EXACT_ORIGIN_PARITY=REQUIRED`
`DETACHED_SYNTHETIC_PROOF=REQUIRED`
`ROLLBACK_ARTIFACT=REQUIRED`
`EXPLICIT_FEATURE_AUTHORIZATION=REQUIRED`
`PRODUCTION_DECISION=BLOCKED`
`PRODUCTION_CHANGE=0`
`LIVE_SIDE_EFFECTS=0`
`BROWSER_LIVE_ACTIONS=0`

## References

1. [`notes-submission-reactions-protected-readiness-contract.md`](./notes-submission-reactions-protected-readiness-contract.md)
2. [`high-risk-seam-readiness-matrix-contract.md`](./high-risk-seam-readiness-matrix-contract.md)
3. [`protected-inline-parity-contract.md`](./protected-inline-parity-contract.md)
4. [`reversible-browser-proof-contract.md`](./reversible-browser-proof-contract.md)
5. [`notes-reaction-owner-independent-proof-rollback-evidence.txt`](./notes-reaction-owner-independent-proof-rollback-evidence.txt)
6. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
