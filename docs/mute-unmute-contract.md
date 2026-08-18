# NovaSocial Mute and Unmute Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-18
**Purpose:** Record the protected mute/unmute mutation and UI synchronization invariants as a standalone contract before any future refactor.

## Contract

`muteUser(userId, btn)` inserts the mute relation with `.throwOnError()`. Only after the mutation succeeds does it show the muted confirmation and change the optional button to `Unmute User` with the corresponding `unmuteUser` inline action.

`unmuteUser(userId, btn)` deletes the exact current-user/target-user mute relation with `.throwOnError()`. Only after success does it show the unmuted confirmation and change the optional button back to `Mute User` with the corresponding `muteUser` inline action.

If either mutation fails, the function shows retry feedback and returns before changing the button. A missing button is tolerated; the database mutation and toast still complete without a DOM update.

## Harness coverage

`docs/mute-unmute-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Successful mute | Use throwOnError, show success, switch to Unmute | PASS |
| Successful unmute | Use throwOnError, show success, switch to Mute | PASS |
| Mute failure | Show retry feedback and preserve button state | PASS |
| Unmute failure | Show retry feedback and preserve button state | PASS |
| Missing button | Complete mutation/toast without DOM update | PASS |

The harness is deterministic and uses mocked database, toast, and button events only. It does not invoke real DOM, Supabase, authentication, profiles, mutes, or account actions.

## Safe boundary

The protected `muteUser()` and `unmuteUser()` implementations and moderation/database boundaries remain inline and unchanged. No mute, unmute, profile, or moderation production code was moved or rewritten in this checkpoint.

## Validation

The standalone harness passed. The complete repository validation chain also passed, including all JavaScript syntax checks, HTML/script integration checks, every `/tmp/validate_*.py` contract validator, inline application-script syntax validation, whitespace checks, protected-function markers, script load order, Branch2 verification, and confirmation that `origin/main` remained unchanged.

## References

1. [`index.html` mute/unmute implementation](../index.html)
2. [`CRITICAL_CONTEXT.md`](../../upload/CRITICAL_CONTEXT.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
