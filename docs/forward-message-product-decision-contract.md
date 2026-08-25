
**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-25
**Purpose:** Define the minimum conservative product decision and authorization boundary for the unresolved `forwardMessage` caller without changing protected DM production behavior.

## Decision

Forwarding is authorized for a future bounded implementation only as an explicit copy-to-existing-conversation action. The user selects one existing conversation visible to the current account; the action creates one new message in that destination conversation and does not create recipients, conversations, contacts, or permissions.

The first implementation scope accepts the source message's text and supported existing media reference fields (`media_url`, `media_type`, and `shared_post_id` when present). It does not upload or transform media. The forwarded message is a new message with the current account as `sender_id` and the selected destination as `conversation_id`; source identity, source timestamp, source database id, reply threading, reactions, read state, and moderation state are not copied into the new message. The product may later add an explicit forward-attribution field, but this contract does not invent one.

The recipient selector must use existing conversation records only. A destination that is unavailable, deleted, inaccessible, or blocked by the existing messaging policy is rejected before any insert. Group conversations are excluded from this first bounded implementation unless the existing product selector already exposes them through the same conversation-list contract. Multiple destinations, new conversation creation, external sharing, and cross-account recipient discovery are out of scope.

The operation is non-optimistic: it performs policy validation, then one message insert, and only after confirmed success may the UI close the action surface, show success feedback, or navigate to the selected existing conversation. Insert failure leaves the source message and destination conversation unchanged and reports failure without retrying or creating compensating records. Realtime delivery remains the existing database/realtime responsibility; this operation must not create a second client-side broadcast path.

## Explicit authorization boundary

This document authorizes only a future implementation and detached synthetic proof of the bounded semantics above. It does not authorize real login, account access, message sending, database or network mutation, media upload, browser navigation, realtime subscription changes, permission prompts, or production extraction from the protected DM inline owner. Any production implementation still requires exact parity against the current protected DM behavior, a focused browser-safe proof, rollback evidence, and the full Branch2 regression gate.

## Harness coverage

`docs/forward-message-product-decision-contract-harness.js` models the decision with plain synthetic objects and injected operations. It verifies destination eligibility, blocked-recipient rejection before insert, field allowlisting, new sender/destination assignment, source immutability, non-optimistic success ordering, insert-failure rollback behavior, and zero upload/realtime/navigation side effects. It does not define or install `window.forwardMessage`.

| Scenario | Expected behavior | Result |
|---|---|---|
| Existing destination | Allow one existing eligible conversation | PASS |
| Blocked destination | Reject before message insert | PASS |
| Payload | Copy only approved text/media/shared-post fields | PASS |
| Identity | Use current sender and selected destination | PASS |
| Source isolation | Do not copy source id, sender, timestamp, reply, reaction, or read state | PASS |
| Failure | Preserve source/destination state and show failure without compensation | PASS |
| Side effects | No upload, client broadcast, navigation, auth, or real mutation in detached proof | PASS |

## Rollback and safety

The proof is detached and synthetic. It has no access to `db`, Supabase, network, storage, browser media, account state, or live navigation. A future production rollout must remain behind the existing caller boundary until focused parity and rollback evidence pass. The rollback is removal of the new implementation and its script reference, restoring the caller-only state verified by `forward-message-seam-parity-contract.md`; no schema migration is authorized by this contract.

## References

1. [`forward-message-seam-parity-contract.md`](./forward-message-seam-parity-contract.md)
2. [`inline-handler-surface-contract.md`](./inline-handler-surface-contract.md)
3. [`index.html`](../index.html)
4. [`branch2-final-readiness-contract.md`](./branch2-final-readiness-contract.md)
5. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
