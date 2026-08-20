# NovaSocial Vanish Mode Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the extracted Vanish Mode UI-toggle invariants before any further structural change.

## Contract

`toggleVanishMode()` inverts the window-scoped `_vanishMode` state, updates the `vanish-btn` icon when present, updates the `mlist` background when the message list exists, and emits the matching ON/OFF toast. Missing optional DOM elements do not prevent the state transition or feedback.

The helper is UI-only. It does not own message fetching, message rendering, persistence, navigation, authentication, or deletion. DM message rendering and any protected vanish semantics remain inline and unchanged.

## Harness coverage

`docs/vanish-mode-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| State transition | Invert window-scoped vanish state | PASS |
| Button state | Show ghost/lock icon according to mode | PASS |
| Message list state | Apply matching background when list exists | PASS |
| Optional DOM | Tolerate absent button or message list | PASS |
| Feedback | Emit matching ON/OFF toast | PASS |
| Scope | Keep helper UI-only and separate from inline DM rendering | PASS |

The harness is deterministic and static. It does not open chats, mutate messages, access real DOM, or persist mode state.

## Safe boundary

The extracted `src/features/toggle-vanish-mode.js` module remains unchanged in this checkpoint. Protected DM rendering, chat opening, message sending, and deletion remain inline and untouched.

## Validation

The standalone harness must pass with all JavaScript syntax checks, every current contract harness, `/tmp/validate_*.py` validators, inline-script validation, whitespace checks, and explicit Branch2/main reference checks.

## References

1. [`toggle-vanish-mode.js`](../src/features/toggle-vanish-mode.js)
2. [`dm-seam-preparation-contract.md`](./dm-seam-preparation-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

