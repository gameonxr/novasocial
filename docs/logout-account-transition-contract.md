# NovaSocial Logout/Account-Transition Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-18
**Purpose:** Define a deterministic, mocked contract before touching the protected logout/account-transition implementation.

## Required order

The current inline `logout()` sequence must be represented by these ordered stages:

1. Remove the incoming-call subscription if present.
2. Remove the self-profile realtime subscription if present.
3. End an active call and stop ringtone playback.
4. Remove the current account from saved sessions.
5. Remove modal overlays and clear the modal subpage stack.
6. Clear the navigation stack and hide the Story viewer.
7. Reset account-scoped UI before sign-out so feed, Story tray, scroll, cache, note, Reels, and screen state cannot leak.
8. Sign out from Supabase.
9. Clear `ME` and `PROF`, then clear navigation state again.
10. If another saved account remains, attempt session restoration and reload; if restoration fails, remove that saved session and fall back to auth.
11. If no saved account remains, show the auth screen.

## Mocked transition outcomes

| Scenario | Required outcome |
|---|---|
| Logout with no remaining account | Teardown, reset, sign-out, identity clear, navigation clear, auth screen |
| Logout with valid remaining account | Teardown, reset, sign-out, identity clear, saved-session set, delayed reload |
| Logout with invalid remaining account | Teardown, reset, sign-out, identity clear, failed session removed, auth fallback |
| Logout while a call is active | Call termination and ringtone stop occur before sign-out |
| Logout with overlays/open Story viewer | Overlays, modal subpage stack, navigation stack, and Story viewer are cleared before sign-out |

## Safety constraints

The harness must not call the real `logout()`, `db.auth.signOut()`, `db.auth.setSession()`, `window.location.reload()`, or any real account mutation. It must use mocked operations and compare event traces only. It must preserve the existing inline `logout()` implementation, `resetAccountScopedUiState`, Calls/WebRTC globals, Story viewer globals, navigation stack, and saved-account functions.

## Acceptance criteria

A future adapter may be considered only if all mocked outcomes preserve the order above, all branches are deterministic, and the full repository/static/protected-marker checks remain green. No production code should move until the harness has a browser-safe equivalent and a manual reversible-account regression pass.

## References

1. [Critical runtime safeguards](file:///home/ubuntu/upload/CRITICAL_CONTEXT.md)
2. [Account/bootstrap contract](file:///home/ubuntu/novasocial/docs/account-bootstrap-contract.md)
3. [Profile logout/account lifecycle caller](file:///home/ubuntu/novasocial/src/features/profile.js)
4. [Navigation stack](file:///home/ubuntu/novasocial/src/core/navigation.js)
