# NovaSocial Chat Actions Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the structural invariants of the extracted chat-actions menu before any future migration of protected chat behavior.

## Contract

`showChatActions(cid)` opens the shared `Chat Options` modal, resolves `#mbody`, and renders a menu container. Call History is conditionally included only when `window._chatOtherId` is available and dispatches through `closeModal();showCallHistory(...)`. Clear Chat dispatches through `clearChat(cid)`, and Cancel dispatches through `closeModal()`.

The helper owns menu rendering and delegation only. Chat deletion, message persistence, call history loading, realtime DM behavior, and all other protected chat execution remain outside this module.

## Harness coverage

`docs/chat-actions-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Modal entry | Use the shared Chat Options modal and `#mbody` | PASS |
| Call history | Gate Call History on `_chatOtherId` and delegate after cleanup | PASS |
| Clear Chat | Preserve the supplied `cid` in the `clearChat` delegation | PASS |
| Cancel | Preserve modal cleanup through `closeModal()` | PASS |
| Menu surface | Preserve the three action labels and menu container | PASS |
| Scope | Keep destructive chat behavior and protected DM systems outside renderer ownership | PASS |

The harness is deterministic and static. It does not open modals, clear chats, load call history, or mutate messages.

## Safe boundary

The extracted `src/features/chat-actions.js` module remains unchanged in this checkpoint. Protected DM, deletion, realtime, and call systems remain untouched.

## Validation

The standalone harness must pass with all JavaScript syntax checks, every current contract harness, `/tmp/validate_*.py` validators, inline-script validation, whitespace checks, and explicit Branch2/main reference checks.

## References

1. [`chat-actions.js`](../src/features/chat-actions.js)
2. [`dms-seam-preparation-contract.md`](./dms-seam-preparation-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

