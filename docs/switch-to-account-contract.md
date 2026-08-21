# NovaSocial Switch To Account Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the extracted saved-account authentication switch helper.

## Contract

`switchToAccount(userId)` reads saved accounts through `getSavedAccounts()`, finds the target by `userId`, and displays the existing missing-account toast with an early return when no target exists. For a target, it displays the switching toast and calls `db.auth.setSession` with the target access and refresh tokens.

On successful session handoff, it closes the modal and schedules a full page reload after the existing 300-millisecond delay. On failure, it displays the existing failure toast and delegates target-session cleanup to `removeAccountSession(userId)`.

The helper owns switch orchestration only. Saved-account storage, authentication provider implementation, modal lifecycle, app bootstrap, and account-session persistence remain outside this module. The harness is static and never calls the authentication provider or uses user credentials.

## Harness coverage

`docs/switch-to-account-contract-harness.js` validates saved-target lookup, missing-target guard, toast branches, token handoff shape, success modal/reload path, failure cleanup, and protected ownership boundaries.

## References

1. [`switch-to-account.js`](../src/features/switch-to-account.js)
2. [`show-account-switcher.js`](../src/features/show-account-switcher.js)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

