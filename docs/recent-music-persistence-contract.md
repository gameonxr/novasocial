# NovaSocial Recent Note-Music Persistence Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the extracted recent note-music persistence invariants before any further structural change.

## Contract

`saveRecentMusic(title, artist, artwork, previewUrl)` reads the `nova_recent_music` local-storage array, removes any existing item with the same title and artist, prepends the new track metadata, caps the list at eight entries, and persists the updated array under the same key. Parse and storage failures are swallowed at the helper boundary.

The helper preserves artwork and preview URL fields for each recent track and remains local-storage-only. It does not own music search, playback, segment selection, note rendering, network calls, or account state.

## Harness coverage

`docs/recent-music-persistence-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Storage key | Read and write `nova_recent_music` | PASS |
| Deduplication | Remove prior item matching title and artist | PASS |
| Ordering | Prepend the newest track | PASS |
| Metadata | Preserve title, artist, artwork, and preview URL | PASS |
| Capacity | Keep at most eight recent tracks | PASS |
| Failure tolerance | Swallow malformed-data and storage failures | PASS |
| Scope | Keep helper local-storage-only and separate from music playback | PASS |

The harness is deterministic and static. It does not access real local storage, search music, play audio, or mutate notes.

## Safe boundary

The extracted `src/features/save-recent-music.js` module remains unchanged in this checkpoint. Protected Notes audio and reaction systems remain inline and untouched.

## Validation

The standalone harness must pass with all JavaScript syntax checks, every current contract harness, `/tmp/validate_*.py` validators, inline-script validation, whitespace checks, and explicit Branch2/main reference checks.

## References

1. [`save-recent-music.js`](../src/features/save-recent-music.js)
2. [`notes-seam-preparation-contract.md`](./notes-seam-preparation-contract.md)
3. [`visibility-audio-lifecycle-contract.md`](./visibility-audio-lifecycle-contract.md)
4. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

