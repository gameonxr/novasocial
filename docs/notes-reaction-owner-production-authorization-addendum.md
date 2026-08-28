# Notes reaction owner — bounded production authorization addendum

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Authorization basis:** User-approved exact-scope continuation after the bounded `reactToNote()` extraction request
**Immutable `origin/main`:** `ef418007c9b9a797488b4825be5f0c807da22369`

## Authorized boundary

This addendum authorizes only the bounded classic-script extraction of the inline `function reactToNote(noteId, emoji, clickedEl)` owner. The owner may retain its existing visual feedback, synthetic burst animation, toast, single `quick_note_reactions` upsert, conflict policy, and success-only `loadNotesBar()` refresh exactly as implemented. The public classic global behavior and script ordering must remain compatible.

The allowed implementation change is limited to moving this one owner to a single external classic script module using an anonymous `window.reactToNote = function(...)` assignment. Exact owner parity, caller behavior, load order, detached lifecycle proof, safe browser observation, reversible rollback, and clean full regression are required before completion is claimed.

## Explicit exclusions

This authorization does not permit live Note reactions or any real database write. Browser work must remain observation-only. It excludes Note creation/update, editor state, media/music attachments, visibility/privacy controls, expiry cleanup, Note viewer audio, reactor-list loading, realtime setup, navigation changes, schema changes, storage, uploads, permissions, account mutations, moderation, and all DMs/chat/realtime owners. It also excludes all other Notes reaction or submission handlers.

## Required gates

| Gate | Required result |
|---|---:|
| Immutable-origin owner parity | PASS |
| Detached success/error/missing-element/payload/timing/cleanup proof | PASS |
| One external classic global owner and one linkage | PASS |
| Single-caller and protected-boundary checks | PASS |
| Authenticated browser observation with no reaction submission | PASS |
| Reversible rollback-after-split proof | PASS |
| Clean full Branch2 regression | PASS |
| Branch2 remote alignment and immutable main | PASS |

## Authorization markers

`FEATURE_AUTHORIZATION=BOUNDED_REACT_TO_NOTE_EXTRACTION`

`PRODUCTION_DECISION=VALIDATION_PENDING`

`PRODUCTION_CHANGE=AUTHORIZED_ON_BRANCH2_ONLY`

`LIVE_REACTION_SUBMISSIONS=0`

`LIVE_DATABASE_WRITES=0`

`LIVE_SIDE_EFFECTS=0`
