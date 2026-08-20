# NovaSocial Open More Emoji Picker Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the structural invariants of the extracted native-emoji reaction picker.

## Contract

`openMoreEmojiPicker(noteId)` creates the `more-emoji-panel` bottom-sheet overlay, renders the keyboard guidance, an emoji input capped at four characters, Send Reaction delegation through `submitNativeEmojiReaction(noteId)`, and Cancel cleanup.

Backdrop clicks remove the panel only when the backdrop itself is clicked. After mounting, the helper resolves `native-emoji-inp` and schedules focus after 150 ms to trigger the native emoji keyboard. Reaction submission and note mutation remain delegated to the protected note-reaction owner.

## Harness coverage

`docs/open-more-emoji-picker-contract-harness.js` validates panel structure, note-ID delegation, four-character input bound, Send Reaction action, Cancel/backdrop cleanup, input lookup, and delayed focus.

The harness is deterministic and static. It does not open the picker, focus inputs, send reactions, or mutate notes.

## Safe boundary

The extracted `src/features/open-more-emoji-picker.js` module remains unchanged in this checkpoint. Protected note reactions and persistence remain untouched.

## References

1. [`open-more-emoji-picker.js`](../src/features/open-more-emoji-picker.js)
2. [`note-reaction-contract.md`](./note-reaction-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

