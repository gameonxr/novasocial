# NovaSocial Admin Access Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-18
**Purpose:** Record the protected admin-panel access gate as a standalone contract before any future refactor.

## Contract

`showAdminPanel()` starts in a verifying state and first calls the server-side `get_admin_context()` RPC. A successful context maps `moderator`, `admin`, `senior_admin`, and `super_admin` roles to staff access. The role-specific profile flags remain distinct: moderators are not marked as admins, while senior and super admins are admins, and super admins additionally receive the super-admin flag. The verified server context also updates the cached profile permissions, feature flags, role, and verification marker.

When the RPC is unavailable or returns an error/context error, the function uses the legacy profile fallback with an eight-second timeout. Fallback access requires `is_admin` or `is_moderator` and explicitly rejects `is_banned === true`. Ordinary users and banned profiles are denied. A verification exception renders the failure state and stops before admin-panel rendering.

The access gate is only a UI entry boundary. Every admin action must continue to use server-side permission checks/RPCs independently; a frontend role or panel state must never be treated as the security boundary.

## Harness coverage

`docs/admin-access-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| RPC moderator role | Grant panel; preserve moderator-only flag | PASS |
| RPC admin role | Grant panel with admin mapping | PASS |
| RPC senior-admin role | Grant panel with admin mapping | PASS |
| RPC super-admin role | Grant panel with admin and super-admin flags | PASS |
| RPC ordinary role | Deny panel | PASS |
| RPC unavailable | Use profile fallback | PASS |
| Legacy admin/moderator fallback | Grant when not banned | PASS |
| Legacy banned profile | Deny even with admin flag | PASS |
| Legacy ordinary profile | Deny panel | PASS |
| Verification exception | Render failure state; do not render panel | PASS |

The harness is deterministic and uses mocked context/profile objects only. It does not invoke real admin RPCs, Supabase, DOM, authentication, user data, or admin actions.

## Safe boundary

The protected `showAdminPanel()`, admin access gate, admin action handlers, and server-side permission boundary remain inline and unchanged. No admin production code was moved or rewritten in this checkpoint.

## Validation

The standalone harness passed. The complete repository validation chain also passed, including all JavaScript syntax checks, HTML/script integration checks, every `/tmp/validate_*.py` contract validator, inline application-script syntax validation, whitespace checks, protected-function markers, script load order, Branch2 verification, and confirmation that `origin/main` remained unchanged.

## References

1. [`index.html` admin access gate](../index.html)
2. [`CRITICAL_CONTEXT.md`](../../upload/CRITICAL_CONTEXT.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
