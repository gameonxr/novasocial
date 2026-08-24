# NovaSocial Account Settings Renderer Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-24
**Purpose:** Record detached evidence for the isolated Account settings modal renderer without executing protected account behavior.

## Contract

`showSettingsAccount()` opens the existing Account modal and renders six account-setting rows: Edit Profile, Password & Security, Verification, Account Information, Download Data, and Deactivate Account. Each row preserves its icon, explanatory copy, chevron, and delegated inline launcher. The renderer only assembles modal markup; it does not invoke any launcher while rendering.

This contract covers only `src/features/settings-account.js`. The delegated `showEditProfile`, `showPasswordReset`, `showVerificationApply`, `showAccountInfo`, `downloadMyData`, and `showDeleteAccount` actions remain outside this contract because they may access account data, security state, export data, or destructive account flows.

## Harness coverage

`docs/settings-account-renderer-contract-harness.js` loads the renderer in a detached VM with synthetic modal and icon mocks. It verifies global availability, modal title, six-row ordering, labels/copy, twelve icon requests, exact launcher wiring, and zero account-action invocation.

| Scenario | Expected behavior | Result |
|---|---|---|
| Modal setup | Open the Account modal and replace its body | PASS |
| Row rendering | Preserve six rows in source order with labels and explanatory copy | PASS |
| Icon rendering | Request six leading icons and six chevrons with expected colors/sizes | PASS |
| Delegation | Preserve all six account launchers without invoking them | PASS |
| Scope | Keep account data, security, export, and destructive actions outside the renderer | PASS |

## Safe boundary

The existing `src/features/settings-account.js` module remains unchanged. This checkpoint adds only detached evidence for its read-only renderer. Account/session state, database/network access, export behavior, password/security flows, account deletion, and live navigation remain outside this contract.

## Validation

The standalone harness must pass with contract-artifact pairing, settings/account safety checks, protected-inline parity, the full Branch2 regression gate, and clean published-tip checks. This contract does not authorize account export, security changes, account deletion, or live account interaction.

## References

1. [`settings-account.js`](../src/features/settings-account.js)
2. [`settings-privacy-contract.md`](./settings-privacy-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
