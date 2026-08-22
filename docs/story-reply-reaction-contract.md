# NovaSocial Story Reaction and Reply Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-18
**Purpose:** Record the protected Story reaction/reply conversation, messaging, and notification invariants as a standalone contract before any future refactor.

## Contract

`sendStoryReply(uid, txt, storyId)` first searches the current user’s existing one-to-one conversations and reuses a shared conversation with the recipient when one exists. If none exists, it creates a new non-group conversation and inserts both members in parallel before inserting the reply message.

The message body is prefixed with `📸 Replied to story: ` and is inserted through `.throwOnError()`. A `MESSAGING_BLOCKED` rejection receives recipient-specific feedback; all other message failures receive generic reply-failure feedback. A successful reply sends a `story_reply` notification whose message preview is truncated to 40 characters, but notification failure remains nonfatal after the message is sent.

`reactToStory()` delegates the reaction to the same story-reply path, attempts a `story_reaction` notification, and only shows the reaction-success toast after the reply path returns. Notification failure remains isolated from the successful reaction path.

## Harness coverage

`docs/story-reply-reaction-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Existing one-to-one conversation | Reuse conversation and insert with `throwOnError` | PASS |
| No existing conversation | Create conversation and both members in parallel | PASS |
| Blocked recipient | Show specific feedback and stop | PASS |
| Generic message failure | Show reply-failure feedback and stop | PASS |
| Conversation creation failure | Stop before message insert | PASS |
| Reply notification | Truncate preview to 40 characters | PASS |
| Notification failure | Keep sent reply successful | PASS |
| Reaction success | Delegate reply and show success toast | PASS |
| Reaction notification failure | Keep reaction success nonfatal | PASS |
| Reply failure during reaction | Stop before reaction success toast | PASS |
| Injected interaction dispatch | Reply and reaction dependencies dispatch explicitly in order; success/failure outcomes remain intact | PASS |

The harness is deterministic and uses mocked conversations, members, message, notification, and toast events only. Its injected interaction dispatcher is test-only and is not loaded by `index.html`. It does not invoke real DOM, Supabase, authentication, messages, notifications, Stories, or account actions.

## Safe boundary

The protected `reactToStory()` and `sendStoryReply()` implementations and Story/DM messaging boundaries remain inline and unchanged. No Story reaction, reply, conversation, or notification production code was moved or rewritten in this checkpoint.

## Validation

The standalone harness passed after correcting one test-only assertion to verify the production contract by prefix plus exactly 40 characters. The complete repository validation chain also passed, including all JavaScript syntax checks, HTML/script integration checks, every `/tmp/validate_*.py` contract validator, inline application-script syntax validation, whitespace checks, protected-function markers, script load order, Branch2 verification, and confirmation that `origin/main` remained unchanged.

## References

1. [`index.html` Story reaction/reply implementation](../index.html)
2. [`CRITICAL_CONTEXT.md`](../../upload/CRITICAL_CONTEXT.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
