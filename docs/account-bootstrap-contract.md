# NovaSocial Account/Bootstrap State Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-18
**Purpose:** Define a reversible contract before touching protected account/bootstrap implementation.

## Contract decision

The next redesign seam must be an adapter contract, not a direct extraction. Existing callers already coordinate authentication, account-scoped UI reset, saved sessions, navigation, realtime teardown, and post-login initialization. The contract below records the required ordering and ownership without changing current behavior.

## Required state domains

| Domain | Current owners/callers | Contract |
|---|---|---|
| Auth identity | `ME`, `PROF`, `db.auth`, `doAuth()` | A successful session must establish `ME`, load `PROF`, synchronize the saved-account entry, and only then enter the authenticated app lifecycle. |
| Add-account mode | `window._addingNewAccount`, `addNewAccount()`, `doAuth()` | Add-account login must clear the mode exactly once, establish the new identity, update saved accounts, and reuse the same authenticated bootstrap path. |
| Account-scoped UI | `resetAccountScopedUiState(null)`, logout, add-account flow, profile/account callers | Before a user changes, cached tabs, scroll, Story tray/viewer state, active note state, Reels persistent container, and screen DOM must not leak into the next account. |
| Realtime/call teardown | `logout()`, call subscription handles, `_selfProfileSub`, `_callState` | Logout must remove active channels, end active calls, stop ringtone, and only then complete sign-out/account transition. |
| Navigation/overlays | `window.navStack`, `clearNavStack()`, modal/overlay removal, `src/core/navigation.js` | Account transition must clear transient overlays and navigation state while preserving the existing history-buffer semantics. |
| Saved sessions | `saveAccountSession`, `removeAccountSession`, `getSavedAccounts`, `switchToAccount` | Logout removes the current session; if another valid saved session exists, transition to it; otherwise show auth UI. Invalid saved sessions are removed and fall back to login. |
| Authenticated bootstrap | inline `showApp()` | Bootstrap must initialize authenticated UI, navigation/feed, realtime subscriptions, offline handlers, saved-account sync, Push behavior, and background lifecycle tasks in the current order. |
| Emergency/security | `checkEmergencyLock()`, `showEmergencyLockScreen()` | Emergency-lock polling and the lockdown overlay remain security-critical inline behavior and must not be bypassed by a new adapter. |

## Current successful-login sequence

Normal password login reaches `db.auth.signInWithPassword`, assigns the returned user to the active identity flow, loads the profile, and hands control to the inline `showApp()` lifecycle. Add-account login additionally clears `window._addingNewAccount`, assigns `ME`, loads the profile, synchronizes the saved-account list, calls `showApp()`, and displays the account-added toast. The adapter must preserve this distinction while sharing one bootstrap implementation later.

## Current logout sequence

`logout()` first tears down call and profile subscriptions, ends active calls, stops ringtone, removes the current saved session, removes modal overlays, clears the modal subpage stack and navigation stack, hides the Story viewer, calls `resetAccountScopedUiState(null)`, signs out from Supabase, clears `ME` and `PROF`, and clears navigation state again. It then either restores a remaining saved session and reloads or displays the auth screen. This ordering is load-bearing and must remain unchanged until a harness proves equivalence.

## Current navigation constraint

`src/core/navigation.js` owns `window.navStack`, history buffering, `popstate`, and navigation logging, but its `popNavState()` and `popstate` handler still depend on inline `_noteViewAudio`, `curTab`, `go()`, and `toast()`. The account/bootstrap adapter must not claim navigation ownership until those dependencies have an explicit interface.

## `showApp()` sequence contract

The current inline bootstrap sequence is intentionally preserved as one lifecycle. It first hides auth and reveals the root, then starts Notifications and Posts realtime, initializes the FAB, starts ban rechecking, checks emergency lock, resets account-scoped UI, and navigates home. It schedules Calls, self-profile realtime, and Notes realtime after 1.5 seconds. It then synchronizes the current saved session, installs offline handlers, shows or silently resubscribes Push, and schedules the 3-second background lifecycle that prioritizes local deletion fallback sync before expired Stories, expired Notes, and admin soft-delete cleanup.

A future adapter must observe or reproduce this ordering without moving a single task across the account-reset, navigation, delayed-realtime, Push, or cleanup boundaries. In particular, local deletion fallback sync must remain the first delayed cleanup task, and the delayed tasks must continue to guard on the active `ME` identity.

## Adapter acceptance criteria

A future adapter may be introduced only if it can be tested against the following invariants without real account mutation:

1. Normal login and add-account login both reach the same bootstrap entrypoint with the correct mode flag.
2. The active identity is available before profile loading and saved-account synchronization complete.
3. Account-scoped reset occurs before sign-out or session replacement.
4. Call/profile subscriptions and active media are torn down before account transition.
5. Navigation and overlays are cleared without changing the existing history-buffer behavior.
6. Remaining saved-session recovery removes invalid sessions and falls back to auth deterministically.
7. Emergency-lock checking remains on the authenticated bootstrap path.
8. Existing inline globals and HTML handlers remain callable.
9. No protected DMs, Reels, Stories, Calls/WebRTC, blocking, Push, or deep-link implementation is moved by the adapter preparation step.

## Selected reversible step

This checkpoint defines the contract and test seam only. It does not change `index.html`, any feature module, auth behavior, navigation behavior, or account state ownership. The next implementation can add a test-only harness or non-invasive assertions around the current flow; direct extraction remains blocked until those assertions pass.

## References

1. [Primary modularization instructions](file:///home/ubuntu/upload/manus_ai_prompt-1.md)
2. [Critical runtime safeguards](file:///home/ubuntu/upload/CRITICAL_CONTEXT.md)
3. [Current migration map](file:///home/ubuntu/novasocial/MIGRATION_MAP.md)
4. [Auth bootstrap caller](file:///home/ubuntu/novasocial/src/features/auth.js)
5. [Profile logout/account lifecycle caller](file:///home/ubuntu/novasocial/src/features/profile.js)
6. [Navigation stack](file:///home/ubuntu/novasocial/src/core/navigation.js)

## Mock adapter harness checkpoint

`docs/account-bootstrap-adapter-harness.js` is a standalone, non-production harness. It records the required bootstrap sequence with mocked operations and validates both normal-login and add-account modes. Add-account mode intentionally records two saved-account synchronization points: the pre-bootstrap sync in `doAuth()` and the post-navigation sync inside `showApp()`. This double point is part of the current behavior and must not be collapsed without a dedicated regression decision.
