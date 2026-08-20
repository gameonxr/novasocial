# NovaSocial Message Favorite Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the extracted message-favorite helper boundary before any further structural change.

## Contract

`favoriteMessage(mid)` is a UI-only helper. It preserves the current success toast and closes the active modal. The message ID parameter remains accepted for inline-call compatibility, but the helper does not own database persistence, message mutation, navigation, or account state.

## Harness coverage

`docs/message-favorite-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Inline entry | Preserve the global `favoriteMessage(mid)` function | PASS |
| Feedback | Show the existing favorite toast | PASS |
| Modal lifecycle | Close the active modal after feedback | PASS |
| Scope | Keep the helper free of database, navigation, and account ownership | PASS |

The harness is deterministic and static. It does not invoke the helper, open a modal, persist favorites, or mutate messages.

## Safe boundary

The extracted `src/features/favorite-message.js` module remains unchanged in this checkpoint. No message or DM production code moved or changed.

## Validation

The standalone harness must pass with all JavaScript syntax checks, every current contract harness, `/tmp/validate_*.py` validators, inline-script validation, whitespace checks, and explicit Branch2/main reference checks.

## References

1. [`favorite-message.js`](../src/features/favorite-message.js)
2. [`forward-message-seam-parity-contract.md`](./forward-message-seam-parity-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

