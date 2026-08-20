# NovaSocial Notes-Audio Helper Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the extracted Notes-audio helper invariants before any further structural change.

## Contract

`autoPlayNoteMusic(url, startSec)` pauses and clears any prior note-view audio, creates a preloaded `Audio` instance, seeks to the requested start position, and attempts playback once metadata is available. It supports the cached-ready path and the `loadedmetadata` path, updates the music icon on play, and restarts the configured segment when playback approaches its end. Autoplay-policy rejection remains non-fatal.

`toggleNoteMusicManual(url, startSec)` pauses current audio and updates the icon when music is already playing; otherwise it delegates to the autoplay controller. `playNextAudio(audioEl)` advances only to the next audio element in document order when one exists. `stopAllPreviewAudio()` pauses and clears preview audio and resets the preview index.

## Harness coverage

`docs/notes-audio-helper-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Autoplay replacement | Pause and clear previous note audio | PASS |
| Audio setup | Create preloaded audio and seek to start position | PASS |
| Metadata timing | Support ready-state and loadedmetadata paths | PASS |
| Segment loop | Restart at the configured start near audio end | PASS |
| Manual toggle | Pause/update icon or delegate to autoplay | PASS |
| Next audio | Play only the immediate next audio element | PASS |
| Preview cleanup | Pause, clear, and reset preview state | PASS |
| Failure tolerance | Keep autoplay-policy rejection non-fatal | PASS |

The harness is deterministic and static. It does not play real audio, access browser media, or mutate Notes state.

## Safe boundary

The extracted Notes-audio helper modules remain unchanged in this checkpoint. The protected Notes audio segmentation and reaction systems remain inline and untouched.

## Validation

The standalone harness must pass with all JavaScript syntax checks, every current contract harness, `/tmp/validate_*.py` validators, inline-script validation, whitespace checks, and explicit Branch2/main reference checks.

## References

1. [`auto-play-note-music.js`](../src/features/auto-play-note-music.js)
2. [`toggle-note-music-manual.js`](../src/features/toggle-note-music-manual.js)
3. [`play-next-audio.js`](../src/features/play-next-audio.js)
4. [`stop-all-preview-audio.js`](../src/features/stop-all-preview-audio.js)
5. [`notes-seam-preparation-contract.md`](./notes-seam-preparation-contract.md)
6. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

