# NovaSocial Attachment Sheet Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the extracted attachment-sheet renderer invariants before any further structural change.

## Contract

`toggleAttachmentSheet(cid)` opens the Attachments modal and renders four action surfaces: Gallery, Camera, Location, and Sticker. Gallery triggers the hidden `dm-file-pick` input; Camera triggers `dm-cam-pick` with image-only capture; Location delegates to `shareLocation(cid)`; Sticker closes the modal and delegates to `openStickerPicker(cid)`.

Both hidden file inputs preserve their media accept/capture attributes and close the modal before delegating selected files to `sendMediaMsg(cid, this)`. The attachment-sheet renderer owns only the action-surface UI; media sending, location sharing, sticker selection, and protected DM behavior remain outside this module.

## Harness coverage

`docs/attachment-sheet-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Modal | Open the Attachments modal and populate its body | PASS |
| Gallery | Trigger `dm-file-pick` for image/video selection | PASS |
| Camera | Trigger `dm-cam-pick` with image capture | PASS |
| Location | Delegate current conversation ID to location sharing | PASS |
| Sticker | Close modal and delegate current conversation ID | PASS |
| File callbacks | Preserve modal close and `sendMediaMsg` delegation | PASS |
| Scope | Keep sending/location/sticker operations outside renderer ownership | PASS |

The harness is deterministic and static. It does not open modals, access file pickers, request location, send media, or open stickers.

## Safe boundary

The extracted `src/features/attachment-sheet.js` module remains unchanged in this checkpoint. Protected DM sending and media systems remain unchanged.

## Validation

The standalone harness must pass with all JavaScript syntax checks, every current contract harness, `/tmp/validate_*.py` validators, inline-script validation, whitespace checks, and explicit Branch2/main reference checks.

## References

1. [`attachment-sheet.js`](../src/features/attachment-sheet.js)
2. [`dm-seam-preparation-contract.md`](./dm-seam-preparation-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

