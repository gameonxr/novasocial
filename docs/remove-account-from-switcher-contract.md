# NovaSocial Remove Account From Switcher Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the extracted saved-account removal helper.

## Contract

`removeAccountFromSwitcher(userId)` protects the currently active account by comparing `userId` with `ME?.id`; when they match, it displays the existing toast and returns without removing the session.

For a different account, it delegates removal to `removeAccountSession(userId)` and refreshes the account list through `showAccountSwitcher()`. The helper owns guard-and-refresh orchestration only; session storage implementation, authentication state, account switching, and account-switcher rendering remain outside this module.

The harness is static and does not remove accounts, mutate storage, or use a logged-in session. Existing user-facing text and optional chaining behavior are documented rather than changed.

## Harness coverage

`docs/remove-account-from-switcher-contract-harness.js` validates current-account protection, toast/early return, removal delegation, switcher refresh, and non-ownership of storage or authentication behavior.

## References

1. [`remove-account-from-switcher.js`](../src/features/remove-account-from-switcher.js)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

