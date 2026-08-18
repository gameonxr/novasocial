# NovaSocial Saved-Account Session Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-18
**Purpose:** Record the protected multi-account local-session persistence invariants as a standalone contract before any future refactor.

## Contract

`saveAccountSession(userId, username, avatarUrl, session)` reads the current `nova_accounts` list, removes any existing entry for the same user ID, and unshifts the newest session to the front. It preserves the latest username, avatar URL, access token, refresh token, and save timestamp. The list is capped at five entries, evicting the oldest entries after insertion.

`removeAccountSession(userId)` removes only the requested user ID and persists the remaining list. `getSavedAccounts()` treats malformed or unavailable JSON as an empty list, allowing a subsequent save to recover from a corrupted local value. The session helpers use local storage as their persistence boundary; the harness does not change their existing error semantics.

## Harness coverage

`docs/saved-account-session-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Existing account save | Replace duplicate and move newest entry to front | PASS |
| Session fields | Preserve latest tokens, profile data, timestamp | PASS |
| Account cap | Retain no more than five sessions | PASS |
| Ordering | Keep newest sessions first | PASS |
| Eviction | Drop oldest entries over cap | PASS |
| Account removal | Remove only requested account | PASS |
| Malformed storage read | Fall back to empty list | PASS |
| Recovery save | Save successfully after malformed storage | PASS |

The harness is deterministic and uses mocked local-storage objects only. It does not invoke real browser storage, authentication, Supabase, account switching, or session tokens.

## Safe boundary

The protected `saveAccountSession()`, `removeAccountSession()`, `getSavedAccounts()`, and account-transition production code remain unchanged. No account, authentication, session, or local-storage production code was moved or rewritten in this checkpoint.

## Validation

The standalone harness passed. The complete repository validation chain also passed, including all JavaScript syntax checks, HTML/script integration checks, every `/tmp/validate_*.py` contract validator, inline application-script syntax validation, whitespace checks, protected-function markers, script load order, Branch2 verification, and confirmation that `origin/main` remained unchanged.

## References

1. [`index.html` saved-account session helpers](../index.html)
2. [`src/features/get-saved-accounts.js`](../src/features/get-saved-accounts.js)
3. [`CRITICAL_CONTEXT.md`](../../upload/CRITICAL_CONTEXT.md)
4. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
