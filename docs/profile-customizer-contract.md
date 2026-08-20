# NovaSocial Profile Customizer Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the extracted profile-customizer invariants before any further structural change.

## Contract

`showProfileCustomizer()` opens the existing customization modal, renders all entries from `PROFILE_THEMES`, preserves theme selection delegation, and retains the Verified Plus activation entry point and explanatory copy.

`setProfileTheme(idx)` validates the selected theme, persists its index to the current profile, synchronizes `PROF.profile_theme`, shows the applied-theme toast, closes the modal, and refreshes the profile. Invalid indices are ignored; persistence failures remain contained by the existing error toast.

`claimVerifiedPlus()` preserves its activation-start feedback, persists `is_verified_plus: true`, synchronizes `PROF.is_verified_plus`, shows success feedback, closes the modal, and refreshes the profile. Activation failures retain the existing retry-later toast boundary.

## Harness coverage

`docs/profile-customizer-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Theme surface | Render all configured themes and Verified Plus entry point | PASS |
| Index guard | Ignore missing theme entries | PASS |
| Theme persistence | Update the current profile’s theme index | PASS |
| Local state | Synchronize `PROF.profile_theme` | PASS |
| Refresh | Close modal and rerender profile after success | PASS |
| Theme failure | Show contained error feedback | PASS |
| Verified Plus | Preserve activation persistence and success flow | PASS |
| Activation failure | Show retry-later feedback | PASS |

The harness is deterministic and static. It does not update real profiles, activate premium status, open modals, or rerender the application.

## Safe boundary

The extracted `src/features/profile-customizer.js` module remains unchanged in this checkpoint. No profile, account, authentication, or premium production code moved or changed.

## Validation

The standalone harness must pass with all JavaScript syntax checks, every current contract harness, `/tmp/validate_*.py` validators, inline-script validation, whitespace checks, and explicit Branch2/main reference checks.

## References

1. [`profile-customizer.js`](../src/features/profile-customizer.js)
2. [`profile-count-refresh-contract.md`](./profile-count-refresh-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

