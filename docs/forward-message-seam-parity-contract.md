# NovaSocial `forwardMessage` Seam Parity Contract

**Repository:** `gameonxr/novasocial`
**Working branch:** `Branch2`
**Reference:** untouched `origin/main`
**Date:** 2026-08-25
**Purpose:** Preserve the pre-existing DM forwarding caller while recording the authorized bounded Branch2 implementation without extracting the protected DM owner.

## Contract

The protected DM action menu contains a caller for `forwardMessage`. The untouched main reference remains caller-only, while Branch2 now contains the authorized bounded inline implementation defined by `forward-message-product-decision-contract.md`. The implementation uses existing eligible one-on-one conversations, allowlisted payload fields, the existing block policy, one insert, and failure-preserving UI behavior; it does not extract the protected DM owner or add upload, navigation, realtime broadcast, or schema behavior.

## Harness coverage

`docs/forward-message-seam-parity-contract-harness.js` compares the current Branch2 `index.html` with `origin/main:index.html` and verifies that both contain the same DM forwarding caller, Branch2 contains the authorized inline implementation, origin/main remains caller-only, and both retain the protected DM markers used by the existing inline-handler contract.

| Check | Expected behavior | Result |
|---|---|---|
| Caller preservation | Branch2 and origin/main both retain the `forwardMessage` caller | PASS |
| Implementation state | origin/main remains caller-only; Branch2 contains the authorized inline implementation | PASS |
| Protected DM boundary | `renderDMs` and `showMsgMenu` remain inline in both references | PASS |
| Branch safety | The comparison is read-only and does not modify main | PASS |

## Safe boundary

This contract compares the caller and protected boundaries against origin/main and records the authorized Branch2 implementation status. Its harness is read-only and detached; it does not send messages, access user accounts, or execute the forwarding handler.

## References

1. [`index.html`](../index.html)
2. [`inline-handler-surface-contract.md`](./inline-handler-surface-contract.md)
3. [`branch2-final-readiness-contract.md`](./branch2-final-readiness-contract.md)

