# NovaSocial Notes Seam-Preparation Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Prepare, but do not execute, a reversible seam for the protected Notes system.

## Preparation map

| Boundary | Current protected owner | Required seam input |
|---|---|---|
| Notes Bar | Extracted `src/features/notes-bar.js` helpers plus inline refresh callers | Stable data/render interface preserving mutual-follow filtering and cache-safe refresh |
| Note viewer | Inline `viewNote()` and protected overlay controls | Viewer adapter preserving own/other controls, expiry path, and delayed overlay creation |
| Note removal | Inline `removeMyNoteFromViewer()` and `deleteMyNote()` | Removal adapter preserving audio pause, artwork lookup, DB delete, cleanup, close, and reload order |
| Note audio | Inline `_noteViewAudio` and music autoplay/start position | Audio lifecycle seam with pause/clear proof |
| Reactions/viewers | Inline `quick_note_views`, `quick_note_reactions`, reactor/count loaders | Data interface preserving current-user and own-note boundaries |
| Media cleanup | Inline Cloudinary artwork cleanup boundary | Cleanup adapter preserving failure feedback and viewer closure |
| Expiry/background | Inline quick-note expiry cleanup and Notes Bar reload | Timer/refresh seam preserving active-account guards |

## Gate status

This is a **mapping-only checkpoint**. Note viewer, removal, reaction, audio, and cleanup implementations remain inline except for the already-approved external `viewNote()`, `removeMyNoteFromViewer()`, and `deleteMyNote()` owners. Six non-destructive browser-context mock artifacts cover empty validation, music-backed insertion, update failure, removal failure, removal success, and Cloudinary-artwork removal, while the behavior harness exposes a test-only injected viewer/removal dispatcher. These artifacts prove reversible mock behavior only and are not permission to extract the remaining Notes interaction owners. Before another split, the project still needs protected before/after marker parity and reversible browser proof for that production boundary itself, including own/other viewer controls, expiry, reactions, audio, and Notes Bar reload.

The first implementation step must be test-only or adapter-only and must preserve the current `viewNote()`, `removeMyNoteFromViewer()`, and `deleteMyNote()` owners until the complete seam harness passes.

## Harness coverage

`docs/notes-seam-preparation-contract-harness.js` scans `index.html` and extracted Notes Bar code to confirm viewer/removal/audio/reaction/media/refresh markers, existing Notes behavior contracts and harnesses, the six passing non-destructive browser mock artifacts, the injected seam-proof marker, approved external owners, protected remaining interaction signatures, and zero unintended matching protected signatures in `src/`. It does not open audio, query Supabase, delete notes, or move production code.

| Check | Expected behavior | Result |
|---|---:|---|
| Viewer owner | `viewNote()` remains inline | PASS |
| Removal owner | `removeMyNoteFromViewer()` and `deleteMyNote()` remain inline | PASS |
| Audio state | `_noteViewAudio` remains protected | PASS |
| Viewer/reaction data | `quick_note_views` and reactions remain protected | PASS |
| Cleanup | Cloudinary artwork cleanup marker remains | PASS |
| Browser mock inventory | Six Notes artifacts cover validation, insert, update failure, removal failure/success, and cloud-artwork cleanup | PASS |
| Injected seam proof | Viewer and removal dependencies dispatch explicitly in test-only mocks | PASS |
| Production split | None | PASS |

## References

1. [`note-viewer-contract.md`](./note-viewer-contract.md)
2. [`note-viewer-contract-harness.js`](./note-viewer-contract-harness.js)
3. [`notes-bar.js`](../src/features/notes-bar.js)
4. [`high-risk-seam-readiness-matrix-contract.md`](./high-risk-seam-readiness-matrix-contract.md)
5. [`index.html`](../index.html)
6. [`notes-browser-proof-evidence.txt`](./notes-browser-proof-evidence.txt)
7. [`notes-music-insert-browser-proof-evidence.txt`](./notes-music-insert-browser-proof-evidence.txt)
8. [`notes-update-failure-browser-proof-evidence.txt`](./notes-update-failure-browser-proof-evidence.txt)
9. [`notes-removal-failure-browser-proof-evidence.txt`](./notes-removal-failure-browser-proof-evidence.txt)
10. [`notes-removal-success-browser-proof-evidence.txt`](./notes-removal-success-browser-proof-evidence.txt)
11. [`notes-removal-cloud-artwork-browser-proof-evidence.txt`](./notes-removal-cloud-artwork-browser-proof-evidence.txt)
12. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

