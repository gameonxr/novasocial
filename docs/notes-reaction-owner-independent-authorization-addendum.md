# Notes Reaction Owner — Scoped Authorization Addendum

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Authorization date:** 2026-08-25
**Baseline commit:** `40802d84409ea252ed790cb3b8d63234a01c914c`
**Immutable `origin/main`:** `ef418007c9b9a797488b4825be5f0c807da22369`

## Authorization decision

This addendum grants explicit scoped authorization to complete detached independent proof for the bounded inline `reactToNote(noteId, emoji, clickedEl)` owner only. It does not authorize production extraction, live Note reactions, real-account access, or any change to the protected Notes system.

| Gate | Decision |
|---|---|
| Candidate | Inline `function reactToNote(noteId, emoji, clickedEl)`, `index.html:10703–10725` |
| Exact origin parity | PASS; normalized owner SHA-256 `3877a5e2a75c4b95ff0e6494a03e7cb9eb2b0f02fee6fe64225c642078986880` |
| Detached proof | PASS; success, missing clicked element, error, payload, timing, cleanup, and optimistic UI checks |
| Side effects | Zero live effects; database upsert is a detached mock only |
| Production extraction | NOT AUTHORIZED |
| Protected accounting | Unchanged: 19 signatures, 9 approved extracted owners, 10 blocked systems |

## Allowed proof surface

The authorized proof may execute the exact unchanged owner in detached VM mocks for `document`, `document.body`, `.note-react-emoji` lookup, element styles, `requestAnimationFrame`, `setTimeout`, `navigator.vibrate`, `toast`, `loadNotesBar`, `ME.id`, and `db.from('quick_note_reactions').upsert(...)`. It may compare before/after traces and record the exact reaction payload and `onConflict` policy.

The authorized scenarios are a successful clicked-element reaction, a successful reaction without a clicked element, and a database-error reaction. The proof must verify background reset, clicked-element transform reset, burst animation/removal, toast behavior, success-only Notes-bar refresh, and zero remaining timers.

## Explicit exclusions

This authorization excludes Note creation/update, editor state, media/music attachments, visibility/privacy controls, expiry cleanup, Note viewer audio, reactor-list loading, realtime subscription setup, navigation, schema changes, storage, uploads, permissions, account mutations, moderation, and all live browser or real-account actions. A proof pass is not permission to split any excluded surface.

## Production re-review requirement

A future production request requires a new explicit authorization for the exact boundary, a controlled non-production split, post-split parity and lifecycle proof, exact rollback-after-split evidence, protected-accounting checks, and a clean full Branch2 regression. Until then:

`FEATURE_AUTHORIZATION=INDEPENDENT_PROOF_ONLY`

`PRODUCTION_DECISION=BLOCKED`

`PRODUCTION_CHANGE=0`

`LIVE_SIDE_EFFECTS=0`
