# NovaSocial Message Clipboard Helpers Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the extracted message clipboard helpers.

## Contract

`copyMsg(id, text)` writes the supplied text through `navigator.clipboard.writeText`, displays the existing success toast on success, displays the existing failure toast on rejection, and removes `#react-box` when present after either outcome.

`copyMsgFromEnc(encText)` decodes the supplied encoded text with `decodeURIComponent(encText || '')`, writes it to the clipboard, displays the existing success toast on fulfillment, and closes the active modal. Its existing rejection behavior remains unchanged and is documented rather than fixed.

The helpers own clipboard/UI feedback only. Message loading, chat realtime, persistence, and modal implementation remain outside this module and protected DM systems remain untouched. The harness is static and never reads or writes the user's clipboard.

## Harness coverage

`docs/message-clipboard-helpers-contract-harness.js` validates both function signatures, clipboard calls, decode behavior, success/failure toasts, reaction-box cleanup, modal closure, and non-ownership of chat/network behavior.

## References

1. [`message-clipboard-helpers.js`](../src/features/message-clipboard-helpers.js)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

