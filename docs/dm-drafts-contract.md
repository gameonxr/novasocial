# NovaSocial DM Draft Persistence Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the extracted local DM draft persistence invariants before any further structural change.

## Contract

`saveDmDraft(cid, text)` reads the `nova-dm-drafts` local-storage object, preserves non-empty trimmed text under the conversation ID, and removes the conversation entry when the supplied text is blank or whitespace-only. It writes the updated object back under the same key and swallows storage or parse failures at the helper boundary.

`clearDmDraft(cid)` reads the same object, removes only the requested conversation ID, persists the remaining drafts, and tolerates malformed or unavailable storage without throwing. Drafts remain isolated by conversation ID, and the helper does not mutate messages, conversations, navigation, or realtime state.

## Harness coverage

`docs/dm-drafts-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Non-empty draft | Save trimmed-content candidate by conversation ID | PASS |
| Blank draft | Remove only the selected conversation draft | PASS |
| Conversation isolation | Preserve other conversation drafts | PASS |
| Explicit clear | Remove selected draft and persist remaining entries | PASS |
| Parse failure | Keep helper non-throwing | PASS |
| Storage failure | Keep helper non-throwing | PASS |
| Scope boundary | Avoid message, navigation, and realtime mutation | PASS |

The harness is deterministic and static. It does not access real browser storage, open chats, send messages, or mutate user data.

## Safe boundary

The extracted `src/features/dm-drafts.js` module remains unchanged in this checkpoint. Protected DM rendering, chat opening, message sending, and realtime code remain inline and untouched.

## Validation

The standalone harness must pass with all JavaScript syntax checks, every current contract harness, `/tmp/validate_*.py` validators, inline-script validation, whitespace checks, and explicit Branch2/main reference checks.

## References

1. [`dm-drafts.js`](../src/features/dm-drafts.js)
2. [`dm-seam-preparation-contract.md`](./dm-seam-preparation-contract.md)
3. [`offline-queue-lifecycle-contract.md`](./offline-queue-lifecycle-contract.md)
4. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

