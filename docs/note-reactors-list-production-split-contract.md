# Notes Reactor-List Production Split Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-23  
**Boundary:** `loadNoteReactorsList(noteId)` only

## Decision

The read-only `loadNoteReactorsList(noteId)` owner is a contained Notes boundary. It queries `quick_note_reactions`, renders the existing empty or populated reactor list into `#note-reactors-list`, and delegates profile navigation through the existing inline HTML handlers. It does not insert, update, delete, subscribe, upload, download, request permission, or mutate account state.

The production owner is represented by exactly one anonymous `window.loadNoteReactorsList` assignment in `src/features/note-reactors-list-owner.js`. The larger Notes viewer, reaction submission, note deletion, audio lifecycle, and Notes Bar refresh owners remain governed by their existing contracts and are not part of this split.

## Independent seam

The candidate harness defines `createInjectedNotesReactorListSeam`, which injects query, container lookup, avatar rendering, and DOM-render dependencies. The seam proves empty results, populated results, missing-container early return, query failure propagation, count pluralization, profile navigation delegation, and emoji rendering without calling Supabase or mutating live data. This is a test-only seam and is not a runtime dependency replacement.

## Required gates

| Gate | Required evidence | Status |
|---|---|---|
| Exact owner parity | Extracted body SHA-256 equals the `origin/main` baseline | PASS |
| Protected marker ownership | Inline owner absent; one anonymous `window.*` owner in the module | PASS |
| Independent seam | Injected query/container/avatar/render proof passes all branches | PASS |
| Read-only browser proof | Before/after authenticated shell and sentinel reactor-list read proof pass | PASS |
| Rollback | Pre-split Branch2 commit and revert procedure are pinned | PASS |
| Full regression | Clean pushed Branch2 tip passes the complete gate | Pending until publication |

## Rollback

If any focused or full regression gate fails after publication, revert the candidate commit identified in `note-reactors-list-parity-rollback-evidence.txt`, restore the inline owner from the pre-split commit, and rerun the complete Branch2 gate before attempting another split.

## Safety boundary

No state-changing Notes control is clicked. The browser proof may perform only a read-only sentinel query and local DOM rendering. No note, reaction, viewer record, profile, message, follow, media, storage, permission, or account data is changed.

## References

1. [`note-reactors-list-production-split-contract-harness.js`](./note-reactors-list-production-split-contract-harness.js)
2. [`note-reactors-list-parity-rollback-evidence.txt`](./note-reactors-list-parity-rollback-evidence.txt)
3. [`note-reactors-list-before-split-browser-proof-evidence.txt`](./note-reactors-list-before-split-browser-proof-evidence.txt)
4. [`note-reactors-list-after-split-browser-proof-evidence.txt`](./note-reactors-list-after-split-browser-proof-evidence.txt)
5. [`notes-seam-preparation-contract.md`](./notes-seam-preparation-contract.md)
6. [`high-risk-seam-readiness-matrix-contract.md`](./high-risk-seam-readiness-matrix-contract.md)
7. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
