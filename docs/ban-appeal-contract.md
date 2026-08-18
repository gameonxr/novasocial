# NovaSocial Ban and Appeal Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-18
**Purpose:** Record the protected ban-recheck, suspended-screen, sign-out, and appeal-flow invariants as a standalone contract before any future refactor.

## Contract

`startBanRecheck()` replaces any previous five-minute interval before scheduling a new profile check. A database error is ignored without changing the active session. When the profile is banned, the system shows the suspended screen with the stored reason or the safe default `Violation of community guidelines`, signs out through Supabase, clears `ME` and `PROF`, hides the application root, shows the auth screen, and clears the recheck interval.

The suspended screen keeps the banned user signed in long enough to choose an appeal or an explicit OK/sign-out action. `signOutBanned()` tolerates an auth-sign-out exception, then always clears local session state, removes the suspended screen, hides the app root, and returns to the auth screen.

`showAppealForm(userId)` removes the suspended screen before opening the appeal modal. `submitBanAppeal()` trims the reason and rejects an empty reason or missing user ID without inserting anything. A valid submission inserts a `pending` row into `ban_appeals`, confirms success, closes the modal, and schedules the banned-user sign-out and UI reset after 1.5 seconds. Database failures do not sign the user out and map to specific guidance for a missing table, duplicate pending appeal, RLS policy failure, or a generic error.

## Harness coverage

`docs/ban-appeal-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Banned recheck | Show reason, sign out, clear session/UI, stop interval | PASS |
| Missing ban reason | Use safe default message | PASS |
| Non-banned profile | Leave session active | PASS |
| Recheck database error | Fail silently and keep session active | PASS |
| Manual banned sign-out | Clear overlay/session and return to auth | PASS |
| Auth sign-out exception | Still reset local session/UI | PASS |
| Empty appeal reason | Block submission with validation toast | PASS |
| Missing appeal user ID | Block submission with account toast | PASS |
| Valid appeal | Insert pending row, confirm, close, schedule 1.5s sign-out | PASS |
| Missing appeals table | Show setup guidance | PASS |
| Duplicate appeal | Show pending-appeal guidance | PASS |
| RLS failure | Show policy guidance | PASS |
| Generic database error | Show generic appeal failure | PASS |

The harness is deterministic and uses mocked state/events only. It does not invoke real DOM, authentication, Supabase, timers, account data, or ban/appeal actions.

## Safe boundary

The protected `startBanRecheck()`, `showBanScreen()`, `signOutBanned()`, `showAppealForm()`, and `submitBanAppeal()` implementations remain inline and unchanged. No ban, authentication, account, or appeal production code was moved or rewritten in this checkpoint.

## Validation

The standalone harness passed. The complete repository validation chain also passed, including all JavaScript syntax checks, HTML/script integration checks, every `/tmp/validate_*.py` contract validator, inline application-script syntax validation, whitespace checks, protected-function markers, script load order, Branch2 verification, and confirmation that `origin/main` remained unchanged.

## References

1. [`index.html` ban and appeal implementation](../index.html)
2. [`CRITICAL_CONTEXT.md`](../../upload/CRITICAL_CONTEXT.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
