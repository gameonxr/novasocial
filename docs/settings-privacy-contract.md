# NovaSocial Settings Privacy Renderer Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-24
**Purpose:** Record detached evidence for the extracted Privacy settings renderer without executing any delegated account or messaging action.

## Contract

`showSettingsPrivacy()` opens the existing `Privacy` modal and renders the current seven settings rows: Ghost Mode, Read Receipts, Private Account, Blocked Users, Close Friends, and Story Privacy. It preserves the current icon calls, status text and colors derived from read-only `PROF` flags, the `ME.id` argument used by Story Privacy, and the existing inline callback wiring. The Message Privacy row remains a local toast delegation.

This renderer owns only modal assembly and read-only status interpolation. The harness does not invoke row handlers. Ghost Mode, Read Receipts, Private Account, blocked users, Close Friends, Story Privacy, message privacy, account state, database/network behavior, and navigation remain delegated or protected outside this contract.

## Harness coverage

`docs/settings-privacy-contract-harness.js` runs the module in a detached VM with synthetic modal, body, icon, toast, and read-only `ME`/`PROF` mocks. It verifies modal title/body setup, all seven current labels, status branches for enabled/disabled flags, icon/order preservation, callback wiring, the `ME.id` interpolation, and zero execution of delegated actions.

| Scenario | Expected behavior | Result |
|---|---|---|
| Modal setup | Open the existing Privacy modal and replace its body | PASS |
| Rows and labels | Preserve all seven current privacy rows | PASS |
| Status rendering | Reflect supplied Ghost Mode, Read Receipts, and Private Account flags | PASS |
| Delegation | Preserve callbacks and Story Privacy account argument | PASS |
| Scope | Do not invoke settings, account, message, or navigation actions | PASS |

## Safe boundary

The existing `src/features/settings-privacy.js` module remains unchanged. This checkpoint adds only detached renderer evidence. Settings mutations, account persistence, messaging privacy, blocked/close-friends management, Story Privacy, and protected feature owners remain outside the contract.

## Validation

The standalone harness must pass with contract-artifact pairing, protected-inline parity, the full Branch2 regression gate, and clean published-tip checks. This contract does not authorize executing a settings action or extracting a protected owner.

## References

1. [`settings-privacy.js`](../src/features/settings-privacy.js)
2. [`read-receipts-contract.md`](./read-receipts-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
