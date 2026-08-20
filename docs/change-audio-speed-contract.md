# NovaSocial Change Audio Speed Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the structural invariants of the extracted audio-speed UI helper.

## Contract

`changeAudioSpeed(btn)` resolves the preceding audio element and returns safely when none exists. It cycles playback speed from `1` to `1.5`, from `1.5` to `2`, and from all other states back to `1`, updating the button label to `1.5x`, `2x`, or `1x` and showing the matching toast.

The helper owns playback-rate and button feedback only. Audio loading, persistence, media selection, and note/story rendering remain outside this module.

## Harness coverage

`docs/change-audio-speed-contract-harness.js` validates sibling-audio lookup, missing-audio guard, speed-cycle branches, button labels, and toast feedback.

The harness is deterministic and static. It does not access audio elements, change playback rates, or render UI.

## Safe boundary

The extracted `src/features/change-audio-speed.js` module remains unchanged in this checkpoint. Protected audio and note/story systems remain untouched.

## References

1. [`change-audio-speed.js`](../src/features/change-audio-speed.js)
2. [`notes-audio-contract.md`](./notes-audio-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

