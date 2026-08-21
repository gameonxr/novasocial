# NovaSocial Message Info Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the extracted read-only message-information modal helper.

## Contract

`showMsgInfo(mid)` creates the existing `Message Info` modal, renders a loading state, reads the message's `created_at` and `seen_at` fields by message ID, and reads related `message_reads` rows with profile usernames by message ID.

It renders the sent timestamp, conditionally renders delivered time when `seen_at` exists, renders each reader's username and read time when read rows are present, and otherwise renders `Not read yet`. The helper owns message-information presentation only; message mutation, chat realtime, access control, and database configuration remain outside this module and protected DM systems remain untouched.

The harness is static and does not query messages, open a modal, or access a logged-in account. Existing timestamp interpolation and null-handling are documented rather than changed.

## Harness coverage

`docs/message-info-contract-harness.js` validates modal/loading setup, message/read-receipt query shape, timestamp branches, read-row rendering, empty-read state, and non-ownership of mutation/realtime behavior.

## References

1. [`message-info.js`](../src/features/message-info.js)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

