# NovaSocial Auth Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the extracted authentication UI and handlers without authenticating or changing credentials.

## Contract

`setMode(m)` synchronizes login/signup tabs, signup-field visibility, primary button copy, switch copy, error visibility, and forgot-password visibility. `doAuth()` trims email, validates required credentials, disables the button during the request, uses password login or signup branches, maps known login errors, handles multi-account completion, requires username for signup, and routes email-confirmation-required signups to the verification screen.

`showEmailVerificationScreen(email)` renders verification instructions and resend routing; `resendVerificationEmail(email)` delegates to the existing signup resend API with success/failure feedback. `showForgotPasswordScreen()` renders reset input and `sendPasswordResetEmail()` validates input, requests a reset link with the reset redirect, reports outcome, and reloads after success.

`showSetNewPasswordScreen()` displays password and confirmation fields; `submitNewPassword()` requires six characters and matching values before updating the password and redirecting. `togglePasswordVisibility(inputId, iconEl)` safely toggles the target input type and icon SVG.

The harness is static and documentation-only. It does not sign in, sign up, resend mail, reset passwords, update credentials, or inspect browser sessions.

## Harness coverage

`docs/auth-contract-harness.js` validates mode synchronization, credential validation, login/signup APIs and branches, verification/reset flows, password rules, redirect behavior, and visibility toggling.

## References

1. [`auth.js`](../src/features/auth.js)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

