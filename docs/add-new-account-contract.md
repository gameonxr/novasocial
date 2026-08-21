# NovaSocial Add New Account Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the extracted new-account login transition helper.

## Contract

`addNewAccount()` reads saved accounts and blocks the transition when `accounts.length >= MAX_ACCOUNTS`, displaying the existing maximum-account toast and returning. Otherwise, it marks the new-account flow with `window._addingNewAccount = true`, clears in-memory `ME` and `PROF`, resets account-scoped UI state with `resetAccountScopedUiState(null)`, hides `#root`, shows `#auth`, switches to login mode, and displays the existing login toast.

The helper owns the UI transition into a new-account login flow only. Authentication submission, saved-session persistence, account bootstrap, logout semantics, and protected account data remain outside this module. The harness is static and never opens a login form or modifies an account.

## Harness coverage

`docs/add-new-account-contract-harness.js` validates account-cap protection, marker assignment, identity clearing, scoped UI reset, root/auth visibility transitions, login-mode selection, user-facing toast, and non-ownership of authentication/network behavior.

## References

1. [`add-new-account.js`](../src/features/add-new-account.js)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

