# NovaSocial Get Saved Accounts Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the structural invariants of the extracted saved-account local-storage reader.

## Contract

`getSavedAccounts()` reads the `nova_accounts` local-storage key, parses its JSON value, and returns an empty array when the key is missing, empty, or malformed. Unexpected storage or parse errors are caught and also return an empty array.

The helper owns local account-list reading only. Authentication, account switching, credential handling, remote profiles, and session transitions remain outside this module.

## Harness coverage

`docs/get-saved-accounts-contract-harness.js` validates the storage key, JSON parsing, empty fallback, exception recovery, and local-only ownership.

The harness is deterministic and static. It does not access local storage, authenticate, or switch accounts.

## Safe boundary

The extracted `src/features/get-saved-accounts.js` module remains unchanged in this checkpoint. Protected authentication and account-transition systems remain untouched.

## References

1. [`get-saved-accounts.js`](../src/features/get-saved-accounts.js)
2. [`account-switcher-contract.md`](./account-switcher-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

