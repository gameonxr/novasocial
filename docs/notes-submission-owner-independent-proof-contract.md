# Notes Submission Owner — Independent Proof Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-25
**Status:** `INDEPENDENT_PROOF_PREPARATION`; production extraction remains `BLOCKED`.

## Candidate boundary

The candidate is the bounded inline `async function submitNote()` owner at `index.html:10649–10684`. It covers text validation, new Note insert, active-Note update, visibility field forwarding, success UI cleanup/refresh, and persistence-error toast behavior.

The candidate excludes media/music selection and upload, editor construction, Note viewer audio, expiry cleanup, reaction submission, reactor-list loading, realtime subscriptions, navigation, schema changes, account bootstrap, and all live behavior.

## Dependencies and side effects

The owner depends on `document.getElementById('note-text-inp')`, `window._noteMusic`, `window._noteVisibility`, `_myActiveNote`, `ME.id`, `db.from('quick_notes')`, `toast`, `closeModal`, and `loadNotesBar`. The only authorized persistence effect in proof is a synthetic `quick_notes.insert` or `quick_notes.update` mock; no real database, storage, network, account, upload, permission, or browser action is allowed.

## Exact parity boundary

The independent harness extracts `submitNote()` from current Branch2 and immutable `origin/main`, normalizes only line endings, and compares the exact owner body. The normalized immutable-origin hash is pinned in `notes-submission-owner-independent-proof-rollback-evidence.txt`. Any owner-body difference fails parity.

## Detached proof matrix

The harness covers empty text without music, successful new-note insert, successful active-note update, insert failure, update failure, exact payload/visibility/expiry policy, success-only modal close and Notes-bar refresh, and failure toast behavior. Before/after traces are compared against immutable origin using detached DOM, account, date, database, and UI mocks.

| Gate | Required result |
|---|---|
| Empty validation | No persistence or success UI side effect; existing validation toast |
| New submission | One exact insert payload with current user and visibility |
| Active-note update | One exact update payload filtered by active note ID |
| Error rollback | Failure toast only; no modal close or Notes-bar refresh |
| Success behavior | Success toast, `closeModal()`, then `loadNotesBar()` |
| Timing/expiry | Synthetic date used for 24-hour expiry calculation |
| Side-effect policy | All live effects zero; persistence is mock-only |

## Authorization boundary

This contract authorizes detached independent proof only. It does not authorize production extraction, live Note creation/update, media attachment, or any real-account action. A future extraction requires new exact-scope production authorization, controlled non-production split, post-split parity, rollback-after-split, protected-accounting checks, and full Branch2 regression.

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
2. [`notes-reaction-owner-independent-proof-contract.md`](./notes-reaction-owner-independent-proof-contract.md)
3. [`high-risk-seam-readiness-matrix-contract.md`](./high-risk-seam-readiness-matrix-contract.md)
4. [`protected-inline-parity-contract.md`](./protected-inline-parity-contract.md)
5. [`notes-submission-owner-independent-proof-rollback-evidence.txt`](./notes-submission-owner-independent-proof-rollback-evidence.txt)
6. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
