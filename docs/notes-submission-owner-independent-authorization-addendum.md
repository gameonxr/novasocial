# Notes Submission Owner — Scoped Authorization Addendum

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Authorization date:** 2026-08-25
**Baseline commit:** `12173d6e0b741ed64ae806e904e46fa443d94a2b`
**Immutable `origin/main`:** `ef418007c9b9a797488b4825be5f0c807da22369`

## Authorization decision

This addendum grants explicit scoped authorization to complete detached independent proof for the bounded inline `async function submitNote()` owner only. It does not authorize production extraction, live Note creation/update, media attachment, or real-account activity.

| Gate | Decision |
|---|---|
| Candidate | Inline `async function submitNote()`, `index.html:10649–10684` |
| Exact origin parity | PASS; normalized owner SHA-256 `f876963b27ad8661f0609e0dce77d55294e1017d03c88f4c5b9e2bae5de91173` |
| Detached proof | PASS; empty validation, insert/update success, insert/update error, payload, visibility, expiry, and UI rollback |
| Database behavior | Mock-only; one insert or update chain per success case |
| Production extraction | NOT AUTHORIZED |
| Protected accounting | Unchanged: 19 signatures, 9 approved extracted owners, 10 blocked systems |

## Allowed proof surface

The proof may execute the exact unchanged owner with synthetic `document.getElementById`, `window._noteMusic`, `window._noteVisibility`, `_myActiveNote`, `ME.id`, constructible `Date`, read-only UI functions, toast functions, and `db.from('quick_notes')` insert/update mocks. It may record exact payloads, the active-note ID filter, success ordering, error behavior, and expiry timestamp calculation.

The authorized scenarios are empty text without music, successful new-note insert, successful active-note update, insert failure, and update failure. The proof must verify that success produces one toast, modal close, and Notes-bar refresh in order, while failure produces only the existing failure toast and does not close or refresh.

## Explicit exclusions

This authorization excludes media/music selection and upload, editor construction, visibility UI mutation beyond field forwarding, expiry cleanup, Note reactions, reactor lists, viewer audio, realtime subscriptions, navigation, schema changes, storage, uploads, permissions, account bootstrap, moderation, and all live browser or real-account actions. A proof pass is not permission to split any excluded surface.

## Production re-review requirement

A future production request requires a new exact-scope production authorization, controlled non-production split, post-split parity and lifecycle proof, rollback-after-split, protected-accounting checks, and a clean full Branch2 regression. Until then:

`FEATURE_AUTHORIZATION=INDEPENDENT_PROOF_ONLY`

`PRODUCTION_DECISION=BLOCKED`

`PRODUCTION_CHANGE=0`

`LIVE_SIDE_EFFECTS=0`
