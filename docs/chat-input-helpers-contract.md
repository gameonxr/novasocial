# NovaSocial Chat Input Helpers Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the extracted chat-input UI helpers.

## Contract

`toggleSendBtn()` reads the trimmed `#minp` value and obtains the camera, microphone, send, and chat-pill elements. If any required element is absent, it returns without mutation.

When text exists, it hides camera/microphone controls, shows the send control, and expands the chat pill. When text is empty, it restores camera/microphone controls, hides send, and removes expansion only when the input is not the active element.

`autoGrow(el)` resets the textarea height to `auto`, sets it to `scrollHeight`, and uses vertical scrolling above 100 pixels while hiding overflow at or below the threshold.

The helpers own chat-input presentation only. Message sending, recording, realtime, and chat state remain outside this module and are not executed by the harness.

## Harness coverage

`docs/chat-input-helpers-contract-harness.js` validates required-element guarding, trimmed-input branches, icon class transitions, pill expansion/focus behavior, textarea height updates, and overflow threshold handling.

## References

1. [`chat-input-helpers.js`](../src/features/chat-input-helpers.js)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

