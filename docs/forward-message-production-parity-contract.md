
**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-25
**Purpose:** Record detached parity evidence for the authorized inline `forwardMessage` implementation without executing real account, database, network, upload, or message mutations.

## Contract

The authorized `forwardMessage(sourceMessageId)` handler opens a local selector backed only by existing conversation memberships. It loads the source message using the existing message table, presents only existing one-on-one conversations other than the source conversation, and excludes group conversations from this bounded first implementation. The selector never creates a conversation or discovers external recipients.

After one destination is selected, `completeForwardMessage(destinationConversationId)` reuses the existing messaging-block policy before inserting one new message. The inserted payload always uses the current account as `sender_id` and the selected conversation as `conversation_id`, and allowlists only `text`, `media_url`, `media_type`, and `shared_post_id` from the source. Source id, original sender, source conversation, timestamp, reply threading, reactions, read state, and other metadata are not copied.

The operation is non-optimistic. It performs the policy check and one database insert before closing the modal or showing success feedback. Blocked recipients are rejected before insert. Insert failure leaves the selector open for retry and reports failure without compensating records. Media is referenced but never uploaded or transformed, and realtime delivery remains the existing database/realtime responsibility; the handler does not create a second broadcast path or navigate the application.

## Harness coverage

`docs/forward-message-production-parity-contract-harness.js` extracts the two actual inline functions into a detached VM with synthetic DOM, database, account, and block-policy mocks. It verifies selector population, one-on-one filtering, source exclusion, group exclusion, exact payload allowlisting, sender/destination assignment, blocked-recipient rejection before insert, insert-failure rollback, and zero upload, realtime, navigation, auth, or live mutation side effects.

| Scenario | Expected behavior | Result |
|---|---|---|
| Selector loading | Load one source message and existing eligible conversations | PASS |
| Destination scope | Exclude source conversation and group conversations | PASS |
| Successful forward | Insert one allowlisted payload and then close/show success | PASS |
| Blocked destination | Run existing block policy and perform zero inserts | PASS |
| Insert failure | Keep selector open and show failure without compensation | PASS |
| Metadata isolation | Do not copy source id, sender, conversation, timestamp, reply, reactions, or read state | PASS |
| Side effects | Perform zero upload, broadcast, navigation, authentication, or live mutations in the harness | PASS |

## Protected boundary and rollback

The handler remains in the protected inline application script; it is not extracted into `src/`, and the existing `renderDMs`, `openChat`, `loadMsgs`, `sendMsg`, message rendering, realtime, media, and account owners remain unchanged. Rollback is a single revert of the implementation commit, which restores the caller-only state verified by `forward-message-seam-parity-contract.md`; the decision and proof artifacts may remain as historical documentation.

This contract authorizes only the bounded behavior described above. It does not authorize group forwarding, multiple destinations, new conversation creation, external sharing, media upload, source attribution, schema migrations, or changes to protected realtime/account/media systems.

## Validation

The detached production parity harness must pass with the product-decision harness, caller/handler surface checks, protected-inline parity, contract-artifact pairing, syntax and whitespace checks, and the exhaustive Branch2 regression gate. No real login, account, message, upload, permission, browser navigation, or database mutation is part of this validation.

## References

1. [`forward-message-product-decision-contract.md`](./forward-message-product-decision-contract.md)
2. [`forward-message-product-decision-contract-harness.js`](./forward-message-product-decision-contract-harness.js)
3. [`forward-message-seam-parity-contract.md`](./forward-message-seam-parity-contract.md)
4. [`index.html`](../index.html)
5. [`branch2-final-readiness-contract.md`](./branch2-final-readiness-contract.md)
