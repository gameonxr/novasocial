# NovaSocial Ghost Mode Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the extracted Ghost Mode toggle invariants before any further structural change.

## Contract

`toggleGhostMode()` derives the next mode by inverting the current profile’s `ghost_mode` value, treating an absent or falsy value as disabled. It persists the new boolean to the current user’s profile through the existing database update boundary, synchronizes `PROF.ghost_mode`, updates the `ghost-status` label, and emits the matching activation/deactivation toast.

The helper remains a focused state-transition boundary. It does not own navigation, authentication, account switching, or unrelated privacy settings. Database errors retain the existing propagation behavior and are not speculatively rewritten in this audit.

## Harness coverage

`docs/ghost-mode-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Disabled state | Toggle falsy/absent mode to `true` | PASS |
| Enabled state | Toggle `true` mode to `false` | PASS |
| Persistence | Update current profile’s `ghost_mode` field | PASS |
| Local state | Synchronize `PROF.ghost_mode` after update | PASS |
| UI state | Update `ghost-status` to ON/OFF labels | PASS |
| Feedback | Emit matching activation/deactivation toast | PASS |
| Scope | Keep helper limited to Ghost Mode state transition | PASS |

The harness is deterministic and static. It does not update real profiles, access the DOM, or show toasts.

## Safe boundary

The extracted `src/features/toggle-ghost-mode.js` module remains unchanged in this checkpoint. No privacy, authentication, account, or visibility production code moved or changed.

## Validation

The standalone harness must pass with all JavaScript syntax checks, every current contract harness, `/tmp/validate_*.py` validators, inline-script validation, whitespace checks, and explicit Branch2/main reference checks.

## References

1. [`toggle-ghost-mode.js`](../src/features/toggle-ghost-mode.js)
2. [`visibility-audio-lifecycle-contract.md`](./visibility-audio-lifecycle-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

