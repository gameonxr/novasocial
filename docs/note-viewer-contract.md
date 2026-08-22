# NovaSocial Note Viewer Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-18
**Purpose:** Record the protected Note viewer, own-note removal, and Note deletion invariants across the completed Branch2 extraction boundaries.

## Contract

`viewNote(noteId)` fetches the Note with its profile. If no Note is returned, it shows expiry feedback and reloads the Notes Bar without creating an overlay. For an existing Note, it upserts a viewer row in `quick_note_views` for the current user, loads the viewer count only when the Note belongs to the current user, and loads the current user’s Note reaction.

The viewer distinguishes own and other Notes. An own Note exposes viewer-count/reactor and removal controls, while another user’s Note exposes reply and reaction controls. If the Note has an attached music preview, the viewer autoplays it from the stored start position. The overlay is appended only after the Note data and dependent state are prepared.

`removeMyNoteFromViewer(noteId)` pauses and clears active Note-view audio, fetches the artwork URL needed for cleanup, deletes the Note, and removes Cloudinary-hosted artwork through the existing media-deletion boundary. Success feedback is followed by viewer close and Notes Bar reload. If deletion or cleanup fails, failure feedback is shown, but the viewer is still closed and the Notes Bar is still reloaded.

## Harness coverage

`docs/note-viewer-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Existing own Note | Register view, load count/reaction, show own controls | PASS |
| Existing other Note | Register view, show reply/reaction controls | PASS |
| Missing/expired Note | Show expiry feedback and reload Notes Bar | PASS |
| Attached music | Autoplay from stored start position | PASS |
| Successful own-Note removal | Pause audio, delete Note, clean Cloudinary artwork | PASS |
| Removal success cleanup | Close viewer and reload Notes Bar | PASS |
| Removal failure | Show failure feedback and still close/reload | PASS |
| Synthetic seam adapter parity | Exact event parity for own/other/expired/music/removal branches; no real side effects | PASS |

The harness is deterministic and uses mocked Note/state events only. The preparation seam comparison additionally proves exact parity across five synthetic scenarios. It does not invoke real DOM, audio, Supabase, account data, Note, reaction, reply, or media-deletion actions.

## Safe boundary

The protected `viewNote()` and `removeMyNoteFromViewer()` owners remain assigned anonymously to `window` in `src/features/note-viewer-owners.js`, and `deleteMyNote()` is assigned anonymously to `window` in `src/features/note-deletion-owner.js`, preserving HTML `onclick` compatibility. Note viewer controls and database/media-deletion behavior remain unchanged; `deleteMediaProduction()` remains outside the owner split as a negative boundary.

## Validation

The standalone harnesses passed before and after extraction. The complete repository validation chain passed after the controlled splits, including JavaScript syntax checks, HTML/script integration checks, protected-function markers, script load order, synthetic browser-context proof, detached rollback proof, whitespace checks, Branch2 verification, and confirmation that `origin/main` remained unchanged.

## References

1. [`index.html` Note viewer/removal implementation](../index.html)
2. [`CRITICAL_CONTEXT.md`](../../upload/CRITICAL_CONTEXT.md)
3. [`note-viewer-seam-comparison-proof-evidence.txt`](./note-viewer-seam-comparison-proof-evidence.txt)
4. [`note-viewer-after-split-browser-proof-evidence.txt`](./note-viewer-after-split-browser-proof-evidence.txt)
5. [`note-viewer-parity-rollback-evidence.txt`](./note-viewer-parity-rollback-evidence.txt)
6. [`note-deletion-browser-parity-harness.js`](./note-deletion-browser-parity-harness.js)
7. [`note-deletion-parity-rollback-evidence.txt`](./note-deletion-parity-rollback-evidence.txt)
8. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
