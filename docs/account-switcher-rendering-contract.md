# NovaSocial Account Switcher Rendering Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the extracted account-switcher rendering and transition invariants before any further structural change.

## Contract

`showAccountSwitcher()` synchronizes the current account into the saved-account list before reading saved accounts, then opens the Switch Account modal and renders each saved account. The current account is highlighted and is not switchable or removable from its own row. Other accounts remain clickable for `switchToAccount(userId)` and expose a stop-propagation removal action.

The modal preserves the Add Account action, which closes the modal before delegating to `addNewAccount()`. `switchToAccount(userId)` validates that the target exists, shows switching feedback, calls the existing Supabase session setter, closes the modal, and reloads the application after success. Session-switch failures show failure feedback and remove the invalid saved session. `removeAccountFromSwitcher(userId)` prevents removing the current account, removes other sessions, and refreshes the switcher list.

## Harness coverage

`docs/account-switcher-rendering-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Pre-render sync | Synchronize current account before rendering | PASS |
| Current account | Highlight and disable switch/remove actions | PASS |
| Other accounts | Preserve switch and remove actions with event isolation | PASS |
| Add account | Close modal and delegate to add-account flow | PASS |
| Target validation | Reject missing saved account with feedback | PASS |
| Session switch | Set session, close modal, and reload after success | PASS |
| Switch failure | Show failure feedback and remove invalid session | PASS |
| Removal guard | Prevent removing current account and refresh after removal | PASS |

The harness is deterministic and static. It does not authenticate, set sessions, reload the browser, remove real accounts, or mutate user data.

## Safe boundary

The extracted account-switcher modules remain unchanged in this checkpoint. Existing account-bootstrap, saved-account, logout-transition, and session contracts remain authoritative; no authentication or account production code moved or changed.

## Validation

The standalone harness must pass with all JavaScript syntax checks, every current contract harness, `/tmp/validate_*.py` validators, inline-script validation, whitespace checks, and explicit Branch2/main reference checks.

## References

1. [`show-account-switcher.js`](../src/features/show-account-switcher.js)
2. [`switch-to-account.js`](../src/features/switch-to-account.js)
3. [`remove-account-from-switcher.js`](../src/features/remove-account-from-switcher.js)
4. [`saved-account-session-contract.md`](./saved-account-session-contract.md)
5. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

