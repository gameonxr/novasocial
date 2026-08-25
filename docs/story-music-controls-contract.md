# NovaSocial Story Music Controls Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-25
**Purpose:** Record detached evidence for the isolated Story-editor music-panel and local music-metadata controls without executing audio playback, media, persistence, or publishing behavior.

## Contract

`seOpenMusicTool()` shows the existing `se-music-panel`, and `seCloseMusicPanel()` hides it. `seSelectMusic(idx)` selects one record from the existing static song list, assigns local `storyEditorMusic`, shows the `se-music-bar`, writes the selected title/artist into `se-music-info`, closes the picker, and shows the existing toast. `removeStoryMusic()` clears the local music record and hides the music bar.

This contract covers only local metadata and UI state already isolated in `src/features/story-music-helpers.js`. Audio playback, media capture, file handling, upload, persistence, account state, network/database access, and Story publishing remain outside this contract.

## Harness coverage

`docs/story-music-controls-contract-harness.js` loads the helpers in a detached VM with synthetic panel, bar, info, and toast mocks. It verifies global availability, panel display transitions, static song selection, local metadata assignment, bar/info updates, automatic picker close, toast behavior, removal cleanup, and zero audio or external side effects.

| Scenario | Expected behavior | Result |
|---|---|---|
| Open control | Show the music picker panel | PASS |
| Music selection | Assign the selected static song and update local UI metadata | PASS |
| Selection cleanup | Close the picker and show the music bar after selection | PASS |
| Removal | Clear local music state and hide the music bar | PASS |
| Scope | Keep playback, media, upload, persistence, network, and publishing outside the controls | PASS |

## Safe boundary

The existing `src/features/story-music-helpers.js` module remains unchanged. This checkpoint adds only detached evidence for local music metadata and panel UI state. Audio playback, media handling, persistence, account state, network/database access, and Story publishing remain untouched.

## Validation

The standalone harness must pass with the existing Story background/text/draw controls, Story-editor seam preparation, Story browser parity, protected-inline parity, contract-artifact pairing, the full Branch2 regression gate, and clean published-tip checks. This contract does not authorize opening media devices, playing or recording audio, uploading media, modifying a real Story, publishing content, or navigating a live application.

## References

1. [`story-music-helpers.js`](../src/features/story-music-helpers.js)
2. [`story-background-controls-contract.md`](./story-background-controls-contract.md)
3. [`story-text-controls-contract.md`](./story-text-controls-contract.md)
4. [`story-editor-seam-preparation-contract.md`](./story-editor-seam-preparation-contract.md)
5. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
