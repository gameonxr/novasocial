# NovaSocial Disappearing-Options Renderer Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-24
**Purpose:** Record a narrowly scoped detached seam for the read-only disappearing-message options renderer without touching the protected persistence owner.

## Contract

`showDisappearingOptions(cid)` opens the existing Disappearing Messages modal and renders the current seven choices: Off, 5 seconds, 1 minute, 1 hour, 24 hours, 7 days, and 90 days. It preserves the explanatory copy, option labels/icons, and inline `setDisappearing(cid, value)` callback wiring for the supplied conversation id.

This contract covers only the renderer portion of `disappearing.js`. The `setDisappearing(cid, val)` function remains explicitly excluded because it updates the `conversations` table, emits toasts, closes the modal, and handles persistence errors. No callback is invoked by the detached harness.

## Harness coverage

`docs/disappearing-options-renderer-contract-harness.js` loads only the renderer slice before the protected mutator in a detached VM with synthetic modal/body mocks. It verifies modal title, explanatory copy, all seven options, option values/icons, conversation-id interpolation, callback order, and zero database/network/storage/account/message/navigation effects.

| Scenario | Expected behavior | Result |
|---|---|---|
| Modal setup | Open the Disappearing Messages modal and replace its body | PASS |
| Options | Preserve all seven current labels, values, and icons | PASS |
| Callback wiring | Preserve the supplied conversation id and value order | PASS |
| Mutator exclusion | Do not load or invoke `setDisappearing()` | PASS |
| Scope | Keep the seam renderer-only and side-effect-free | PASS |

## Safe boundary

The existing `src/features/disappearing.js` module remains unchanged. This checkpoint adds only detached evidence for the renderer slice. Conversation persistence, disappearing-message updates, toasts, modal close behavior, account/chat state, database/network access, and protected DM systems remain outside the contract.

## Validation

The standalone harness must pass with contract-artifact pairing, DM preparation, protected-inline parity, the full Branch2 regression gate, and clean published-tip checks. This contract does not authorize invoking `setDisappearing`, updating a conversation, or extracting the protected mutator.

## References

1. [`disappearing.js`](../src/features/disappearing.js)
2. [`dms-seam-preparation-contract.md`](./dms-seam-preparation-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
