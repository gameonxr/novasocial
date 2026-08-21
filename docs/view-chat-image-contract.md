# NovaSocial View Chat Image Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the extracted chat-image viewer UI helper.

## Contract

`viewChatImage(url)` creates the existing blank modal, hides its header, applies the dark sheet background, and renders an image container with the supplied image URL and a download control delegating to `downloadMedia(url, 'novasocial_image')`.

The helper assigns backdrop dismissal that closes the modal only when the modal itself is the event target. It owns chat-image viewer presentation only; DM realtime, message loading, media download implementation, and chat state remain outside this module.

The existing URL interpolation is preserved and documented rather than changed because this checkpoint is structural and production-safe. The harness is static and does not open a modal, access a chat session, or download media.

## Harness coverage

`docs/view-chat-image-contract-harness.js` validates modal creation, header/sheet styling, image markup, download delegation, backdrop dismissal, and non-ownership of realtime/network behavior.

## References

1. [`view-chat-image.js`](../src/features/view-chat-image.js)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

