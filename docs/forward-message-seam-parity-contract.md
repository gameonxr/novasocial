# NovaSocial `forwardMessage` Seam Parity Contract

**Repository:** `gameonxr/novasocial`
**Working branch:** `Branch2`
**Reference:** untouched `origin/main`
**Date:** 2026-08-19
**Purpose:** Preserve the documented pre-existing DM forwarding seam without inventing behavior during modularization.

## Contract

The protected DM action menu contains a caller for `forwardMessage`, but neither Branch2 nor the untouched main reference contains an implementation or assignment for that handler. Because forwarding requires product decisions about recipient selection, message payloads, media handling, and persistence, modularization must preserve the caller and the unresolved state rather than introduce speculative behavior.

## Harness coverage

`docs/forward-message-seam-parity-contract-harness.js` compares the current Branch2 `index.html` with `origin/main:index.html` and verifies that both contain the same DM forwarding caller, neither defines `forwardMessage`, and both retain the protected DM markers used by the existing inline-handler contract.

| Check | Expected behavior | Result |
|---|---|---|
| Caller preservation | Branch2 and origin/main both retain the `forwardMessage` caller | PASS |
| Implementation state | Neither reference defines or assigns `forwardMessage` | PASS |
| Protected DM boundary | `renderDMs` and `showMsgMenu` remain inline in both references | PASS |
| Branch safety | The comparison is read-only and does not modify main | PASS |

## Safe boundary

This is a documentation-only parity audit. It does not alter DM code, add forwarding behavior, send messages, or access user accounts.

## References

1. [`index.html`](../index.html)
2. [`inline-handler-surface-contract.md`](./inline-handler-surface-contract.md)
3. [`branch2-final-readiness-contract.md`](./branch2-final-readiness-contract.md)

