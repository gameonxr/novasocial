# Notes Submission Owner — Dependency Map and Before-Proof

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Candidate:** inline `async function submitNote(){...}` in `index.html`  
**Production extraction:** not authorized by the existing addendum

## Exact dependency surface

The bounded owner depends on the synthetic/UI boundary values `document.getElementById(...)`, `window._noteMusic`, `window._noteVisibility`, `_myActiveNote`, `ME.id`, and constructible `Date`. Its success path calls the existing `db.from('quick_notes')` insert/update chain, then the existing toast, modal-close, and Notes-bar refresh functions. The update path uses `_myActiveNote.id` as the `eq('id', ...)` filter and computes `expires_at` from the current time plus 24 hours. The insert path selects the created record after persistence.

The proof surface intentionally mocks only those dependencies. It excludes media/music selection and upload, editor construction, visibility mutation beyond forwarding, expiry cleanup, reactions, reactor lists, viewer audio, realtime, navigation, schema changes, storage, uploads, permissions, account bootstrap, moderation, live browser actions, and real-account activity.

## Before-proof result

The existing independent contract harness passed exact immutable-origin parity and all five authorized scenarios: empty validation, successful new-note insert, successful active-note update, insert failure, and update failure. It also passed exact payload, visibility, expiry, success UI ordering, and failure UI rollback checks. Database calls were mock-only, with network, storage, upload, permission, navigation, media, and account side effects at zero.

`PRODUCTION_SPLIT=0` remains required. This document records preparation only; it does not authorize extraction or live Notes activity.
