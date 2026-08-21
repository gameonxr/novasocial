# NovaSocial Show Account Switcher Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the extracted account-switcher modal renderer.

## Contract

`showAccountSwitcher()` first delegates to `syncCurrentAccountToSavedList()`, then reads accounts through `getSavedAccounts()`, creates the existing `Switch Account` modal, and renders each saved account.

Each account row compares `acc.userId` with `ME?.id`; the current account receives current styling and no switch action, while other accounts retain `switchToAccount(...)` row delegation and `removeAccountFromSwitcher(...)` close-action delegation with event propagation stopped. The renderer also retains the Add Account row delegating to `closeModal();addNewAccount()`.

The helper owns modal markup only. Account synchronization, saved-session storage, authentication, switching, removal, and modal implementation remain outside this module. The harness is static and does not inspect or mutate any logged-in account.

## Harness coverage

`docs/show-account-switcher-contract-harness.js` validates synchronization/read delegation, modal creation, current-account branching, switch/remove handlers, event-stop behavior, account metadata rendering, and add-account delegation.

## References

1. [`show-account-switcher.js`](../src/features/show-account-switcher.js)
2. [`remove-account-from-switcher.js`](../src/features/remove-account-from-switcher.js)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

