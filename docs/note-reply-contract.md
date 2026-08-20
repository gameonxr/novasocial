# NovaSocial Note-Reply Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the extracted note-reply helper invariants before any further structural change.

## Contract

`sendNoteReply(noteId, noteOwnerId)` reads and trims the note-reply input, returns without sending for blank text, and clears the input after accepting content. It first searches the current user’s one-to-one conversation memberships for an existing conversation with the note owner. If none exists, it creates a one-to-one conversation and inserts both memberships before sending.

The message preserves the `💭 Replied to your note: ...` text format. Successful sends show feedback and remove the note-view overlay. Message-send failures distinguish `MESSAGING_BLOCKED` from generic failures, while outer failures retain the generic reply-failed toast. The helper does not own DM rendering, chat navigation, or protected message refresh behavior.

## Harness coverage

`docs/note-reply-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Blank input | Return without sending | PASS |
| Input lifecycle | Trim and clear accepted text | PASS |
| Conversation reuse | Search one-to-one memberships with note owner | PASS |
| Conversation creation | Create conversation and both memberships when absent | PASS |
| Message format | Preserve note-reply prefix and text | PASS |
| Success | Show feedback and remove note overlay | PASS |
| Blocked messaging | Show user-facing blocked-recipient feedback | PASS |
| Generic failure | Preserve reply-failed feedback | PASS |
| Scope | Keep helper separate from protected DM rendering/navigation | PASS |

The harness is deterministic and static. It does not send messages, create conversations, or mutate real account data.

## Safe boundary

The extracted `src/features/send-note-reply.js` module remains unchanged in this checkpoint. Protected DM rendering, chat opening, sending, and navigation remain inline and untouched.

## Validation

The standalone harness must pass with all JavaScript syntax checks, every current contract harness, `/tmp/validate_*.py` validators, inline-script validation, whitespace checks, and explicit Branch2/main reference checks.

## References

1. [`send-note-reply.js`](../src/features/send-note-reply.js)
2. [`dm-seam-preparation-contract.md`](./dm-seam-preparation-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

