# NovaSocial Admin Panel Rendering Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the admin-panel rendering and tab-dispatch invariants before any further structural change.

## Contract

`showAdminPanel()` obtains the current profile before rendering the admin surface. Banned users and non-admin users receive an access-denied state with a close action; only approved admin profiles reach the panel UI. The panel’s current tab state is initialized through the existing admin UI boundary and all admin actions remain subject to their existing server/database authorization paths.

`loadAdminTab(tab)` records the selected tab, requires the admin-content container, renders a loading state before dispatch, and routes known tab names to their existing tab renderers. Unknown or failing tab work is contained by the existing error surface rather than leaving stale content or throwing to the caller. The deleted-content tab retains its existing dedicated loader and the two-tier deletion/recovery contract remains authoritative for destructive actions.

The admin audit boundary uses the server-side `log_audit_entry` RPC and swallows logging failures at the logging helper boundary. Admin notification dispatch remains best effort and is covered separately by the notification-dispatch contract. User, report, verification, appeal, team, approval, audit, and content tabs remain inline and unchanged in this audit.

## Harness coverage

`docs/admin-panel-rendering-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Access gate | Profile lookup and banned/non-admin denial remain present | PASS |
| Panel entry | Approved admin reaches the existing panel UI boundary | PASS |
| Tab dispatch | Loading state and known-tab routing remain present | PASS |
| Failure surface | Tab failures render contained error feedback | PASS |
| Audit boundary | Server-side `log_audit_entry` RPC remains the audit owner | PASS |
| Destructive actions | Two-tier delete/recovery behavior remains delegated to its existing contract | PASS |
| Notification boundary | Admin notification helper remains separately governed | PASS |

The harness is deterministic and static. It does not authenticate, query Supabase, mutate moderation state, send notifications, or delete content.

## Safe boundary

No admin-panel production code is moved or rewritten by this checkpoint. `showAdminPanel()`, `loadAdminTab()`, all tab renderers, moderation actions, audit logging, and two-tier deletion/recovery remain inline and unchanged.

## Validation

The standalone harness must pass with all JavaScript syntax checks, every current contract harness, `/tmp/validate_*.py` validators, inline-script validation, whitespace checks, and explicit Branch2/main reference checks.

## References

1. [`index.html`](../index.html)
2. [`admin-post-delete-two-tier-contract.md`](./admin-post-delete-two-tier-contract.md)
3. [`admin-notification-contract.md`](./admin-notification-contract.md)
4. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

