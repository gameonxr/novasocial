# NovaSocial Update Account Avatar Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the extracted saved-account avatar updater.

## Contract

`updateAccountAvatar(userId, avatarUrl)` reads saved accounts through `getSavedAccounts()`, finds the account matching `userId`, and updates only that account's `avatarUrl` when a match exists. It then persists the complete account list under the existing `nova_accounts` local-storage key.

When no account matches, it performs no mutation or persistence write. The helper owns saved-account avatar synchronization only; profile updates, remote storage, authentication, and account-switcher rendering remain outside this module.

The harness is static and does not access local storage, account sessions, or user data. Existing in-place mutation and conditional write behavior are documented rather than changed.

## Harness coverage

`docs/update-account-avatar-contract-harness.js` validates saved-account lookup, matching by user ID, avatar mutation, storage key/persistence, unmatched-account no-op scope, and non-ownership of remote/profile updates.

## References

1. [`update-account-avatar.js`](../src/features/update-account-avatar.js)
2. [`show-account-switcher.js`](../src/features/show-account-switcher.js)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

