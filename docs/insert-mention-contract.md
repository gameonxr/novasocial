# NovaSocial Insert Mention Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the extracted inline mention insertion helper.

## Contract

`insertMention(username, inpId)` obtains the input by `inpId`, splits its value on spaces, replaces the final token with `@` plus the selected username and a trailing space, and writes the joined result back to the input.

It removes `#mention-list` when present and focuses the input afterward. The helper owns insertion UI state only; chat member lookup, message sending, mention rendering, and DM realtime remain outside this module and protected DM systems remain untouched.

The harness is static and does not access a chat session, modify messages, or create browser DOM.

## Harness coverage

`docs/insert-mention-contract-harness.js` validates input lookup, token splitting, final-token replacement, trailing-space format, mention-list cleanup, focus restoration, and non-ownership of network or message behavior.

## References

1. [`insert-mention.js`](../src/features/insert-mention.js)
2. [`check-mention.js`](../src/features/check-mention.js)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

