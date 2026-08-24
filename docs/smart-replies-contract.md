# NovaSocial Smart Replies Classifier Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-24
**Purpose:** Record test-only evidence for the pure reply-suggestion classifier without moving or changing protected chat sending behavior.

## Contract

`getSmartReplies(lastMsg)` normalizes the provided message to lowercase, chooses the first matching greeting, status, thanks, goodbye, question, affection, or food rule, and otherwise returns the existing five-item fallback list. Missing or non-string-like input follows the existing falsy fallback behavior. The rule order is load-bearing because a message may contain more than one keyword family.

The classifier is **pure**. It does not access the DOM, database, network, storage, account state, navigation, media, or message APIs. The adjacent `showSmartReplies(cid, lastMsg)` renderer and `quickSendReply(cid, text)` sender remain outside this contract; `quickSendReply` calls the protected `sendMsg` chat action and is not a safe extraction target.

## Harness coverage

`docs/smart-replies-contract-harness.js` loads `src/features/smart-replies.js` in a detached VM and invokes only `getSmartReplies`. It verifies case-insensitive matching, first-rule precedence, null/fallback behavior, exact suggestion lists, and pure scope. No DOM, account, message, database, network, storage, or live application behavior is used.

| Scenario | Expected behavior | Result |
|---|---|---|
| Greeting | Return the existing greeting suggestions | PASS |
| Status | Return the existing status suggestions | PASS |
| Rule precedence | Use the first matching rule | PASS |
| Question/affection/food | Return each existing category list | PASS |
| Empty or unknown input | Return the existing fallback list | PASS |
| Scope | Keep rendering and `sendMsg` chat behavior outside the classifier | PASS |

## Safe boundary

The existing `src/features/smart-replies.js` module remains unchanged. This checkpoint adds only a detached contract and harness for its pure classifier. Protected DM rendering, realtime state, `showSmartReplies`, `quickSendReply`, and `sendMsg` remain unchanged.

## Validation

The standalone harness must pass with contract-artifact pairing, protected-inline parity, the full Branch2 regression gate, and clean published-tip checks. This contract does not authorize a production split or any live messaging action.

## References

1. [`smart-replies.js`](../src/features/smart-replies.js)
2. [`dms-seam-preparation-contract.md`](./dms-seam-preparation-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
