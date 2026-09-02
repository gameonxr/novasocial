# Notes Submission Owner — Production Authorization Addendum

**Status:** Explicitly authorized by the project owner for bounded Branch2-only extraction, subject to every post-split gate.
**Repository:** `gameonxr/novasocial`
**Branch restriction:** `Branch2` only
**Draft date:** 2026-09-01
**Current Branch2 baseline:** `3177f3b0124b2f9b9af7a82d1e6d7fdff2d761bc`
**Immutable `origin/main`:** `ef418007c9b9a797488b4825be5f0c807da22369`

## Purpose and decision status

This document records the project owner’s explicit authorization for a bounded production extraction of the Notes submission owner on `Branch2` only. The authorization is conditional: extraction and publication may proceed only through the exact scope below and only if every post-split gate passes. **No live Notes operation, database write, storage operation, upload, permission request, or real-account action is authorized during validation.**

The proposed scope is limited to extracting the exact existing inline `async function submitNote(){...}` owner from `index.html` into one external classic-script module while preserving the existing global/caller contract and script execution order. The project owner has approved the exact statement in the approval block below; that approval is limited to this owner and does not authorize any broader Notes or platform surface.

## Exact bounded owner boundary

| Item | Proposed boundary |
|---|---|
| Owner | Inline `async function submitNote(){...}` |
| Current source range | `index.html:10143–10179` on Branch2 baseline `3177f3b` |
| Proposed module | `src/features/notes-submission-owner.js` |
| Proposed classic global | `window.submitNote` with the same callable behavior and function body |
| Proposed linkage | One classic `<script src="src/features/notes-submission-owner.js"></script>` in the existing order, before the inline application script if required by the established owner pattern |
| Baseline normalized owner SHA-256 | `f876963b27ad8661f0609e0dce77d55294e1017d03c88f4c5b9e2bae5de91173` |
| Current independent proof | PASS; synthetic/mock-only, `PRODUCTION_SPLIT=0` |

The extraction must move only the authorized owner body. It must not rewrite callers, rename globals, change the data schema, alter the Notes editor, or change any dependency outside the owner boundary.

## Dependency and behavior contract

The owner reads the existing `document.getElementById('note-text-inp')?.value?.trim()` value, `window._noteMusic`, `window._noteVisibility`, `_myActiveNote`, `ME.id`, and `Date`. It uses the existing `db.from('quick_notes')` insert/update/select/eq chain, then calls the existing `toast`, `closeModal`, and `loadNotesBar` functions. The update path filters by `_myActiveNote.id` and includes the existing 24-hour `expires_at` calculation; the insert path includes the existing `ME.id` user identifier and selects the created record.

The extracted classic module must preserve the following behavior exactly: empty text without music shows the existing validation toast and performs no persistence; successful insert and update preserve their exact payloads and ordering; successful persistence produces one success toast followed by modal close and Notes-bar refresh; and failures produce only the existing failure toast without closing or refreshing.

## Required authorization gates before extraction

Production extraction may begin only after the project owner confirms the exact approval statement below and the following prerequisites remain true:

| Gate | Required condition |
|---|---|
| Branch and origin safety | Work is on `Branch2`; immutable `origin/main` remains `ef418007c9b9a797488b4825be5f0c807da22369` |
| Baseline parity | Current inline owner matches the recorded normalized origin owner hash exactly |
| Dependency map | The bounded dependency map is reviewed and unchanged outside the stated scope |
| Detached before-proof | Existing independent harness passes all five scenarios and zero-live-effect assertions |
| Exact extraction | One owner module, one linkage, no duplicate global, no unrelated refactor |
| Classic-script compatibility | No ES module syntax, `defer`, `async`, or script-order regressions |
| Post-split parity | External owner body matches the immutable origin owner exactly |
| Lifecycle behavior | Empty, insert success, update success, insert error, update error, payload, expiry, UI ordering, and cleanup checks all pass |
| Rollback-after-split | Disposable reverse-state proof restores the exact pre-split bytes and preserves `origin/main` |
| Browser-safe observation | Preview module returns HTTP 200 and global owner loads; owner is not invoked |
| Full regression | All published Branch2 harnesses pass with a clean worktree |

## Explicit exclusions

This proposed authorization excludes media/music selection and upload, editor construction, visibility UI mutation beyond field forwarding, expiry cleanup, Note reactions, reactor lists, viewer audio, realtime subscriptions, navigation, schema changes, storage, uploads, permissions, service workers, Push APIs, account bootstrap, moderation, and all live browser or real-account actions.

It also excludes changes to `loadNotesFeed`, the Notes editor/modal, Notes realtime, Notes reaction and reactor-list owners, viewer functions, database schema or policies, Supabase Edge Functions, VAPID or Push configuration, and any caller or unrelated inline code. Synthetic database mocks may be used only for proof; no real database write or real Note creation/update is permitted during validation.

## Recorded approval statement

The project owner explicitly sent the following statement, authorizing only this bounded extraction:

> “I explicitly authorize the bounded production extraction of `submitNote()` on `Branch2` only, limited to the exact owner boundary and exclusions in the Notes submission production authorization addendum. Preserve the classic `window` behavior, script order, exact parity, rollback, and all exclusions. Production publish requires every post-split gate to pass. Do not perform live Note creation/update, database, storage, upload, media, permission, service-worker, Push, network, account, or real-browser actions during validation.”

An approval for this owner would not authorize any broader Notes, database, media, realtime, account, or Push system.

## Current decision markers

`FEATURE_AUTHORIZATION=EXPLICIT_BOUNDED_PRODUCTION_EXTRACTION`
`PRODUCTION_DECISION=AUTHORIZED_CONDITIONAL_ON_ALL_GATES`
`PRODUCTION_CHANGE=0`
`LIVE_SIDE_EFFECTS=0`
`BRANCH_SCOPE=Branch2_ONLY`

## Review references

The existing independent authorization remains the governing pre-production record: `docs/notes-submission-owner-independent-authorization-addendum.md`. The dependency map is recorded in `docs/notes-submission-owner-dependency-map.md`, and the independent proof contract is recorded in `docs/notes-submission-owner-independent-proof-contract.md`. This authorization supersedes the independent-proof-only production block for this exact owner boundary, but it does not authorize any excluded surface.
