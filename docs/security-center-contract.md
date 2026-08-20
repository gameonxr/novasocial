# NovaSocial Security Center Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the extracted Security Center display and capability-gating invariants before any further structural change.

## Contract

`showSecurityCenter()` opens the existing Security Center modal and preserves the session/device summary, current-device status, logout-device action, recent-activity notice, anti-bot status, login-alert status, and Done control. The display remains self-contained and does not claim server-backed device enumeration in this module.

`setup2FA()` opens the existing 2FA modal and preserves SMS, authenticator-app, and email choices with their current toast-and-close behavior. `toggleBiometric(btn)` first checks credential support, shows an unsupported-device message when unavailable, and otherwise preserves the existing enabling state transition, success feedback, and delayed button styling. `logoutDevice(device)` retains its current success feedback boundary.

## Harness coverage

`docs/security-center-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Security modal | Preserve session, device, activity, protection, alert, and close surfaces | PASS |
| Device action | Preserve logout-device delegation and feedback | PASS |
| 2FA modal | Preserve SMS, authenticator, and email choices | PASS |
| Capability gate | Handle missing credential support before enabling | PASS |
| Biometric transition | Preserve enabling, delayed success state, and toast | PASS |
| Scope | Keep display helper free of database and account mutation ownership | PASS |

The harness is deterministic and static. It does not authenticate, register WebAuthn credentials, log out devices, or mutate security settings.

## Safe boundary

The extracted `src/features/security-center.js` module remains unchanged in this checkpoint. No authentication, account, session, or device-management production code moved or changed.

## Validation

The standalone harness must pass with all JavaScript syntax checks, every current contract harness, `/tmp/validate_*.py` validators, inline-script validation, whitespace checks, and explicit Branch2/main reference checks.

## References

1. [`security-center.js`](../src/features/security-center.js)
2. [`security-center-contract.md`](./security-center-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

