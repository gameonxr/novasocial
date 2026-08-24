# NovaSocial Settings Features Renderer Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-24
**Purpose:** Record detached evidence for the extracted Settings Features modal renderer without executing any delegated feature, account, or navigation action.

## Contract

`showSettingsFeatures()` opens the existing `Features` modal, renders the existing feature-launch rows, preserves the current labels and icon calls, and retains the inline delegation order for Nova Universe, Nova AI, AI Editor, Voice Rooms, Communities, Channels, Wallet, Memories, Story Highlights, Smart Feed, and Creator Tools. The Story Highlights row continues to receive the read-only `ME.id` value used by its existing inline handler.

This renderer owns only modal assembly and markup. The harness does not invoke any row handlers. Feature launchers, account-scoped Story Highlights, Smart Feed, Wallet, media tools, navigation, database/network work, and all protected application systems remain delegated outside this contract.

## Harness coverage

`docs/settings-features-contract-harness.js` runs the module in a detached VM with synthetic modal, body, icon, and read-only account mocks. It verifies modal title/body setup, all eleven row labels, icon calls, callback wiring, feature order, `ME.id` interpolation, and zero execution of delegated actions or protected side effects.

| Scenario | Expected behavior | Result |
|---|---|---|
| Modal setup | Open the existing Features modal and replace its body | PASS |
| Feature rows | Preserve all eleven current rows and labels | PASS |
| Delegation | Preserve callback order and Story Highlights account argument | PASS |
| Scope | Do not invoke delegated launchers or perform protected effects | PASS |

## Safe boundary

The existing `src/features/settings-features.js` module remains unchanged. This checkpoint adds only detached renderer evidence. Settings privacy/account state, Story Highlights, Smart Feed, Wallet, media tools, navigation, database/network behavior, and protected feature owners remain outside the contract.

## Validation

The standalone harness must pass with contract-artifact pairing, protected-inline parity, the full Branch2 regression gate, and clean published-tip checks. This contract does not authorize executing a feature launcher or extracting any protected owner.

## References

1. [`settings-features.js`](../src/features/settings-features.js)
2. [`settings-privacy.js`](../src/features/settings-privacy.js)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
