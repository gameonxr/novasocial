# NovaSocial Admin Team List Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-18
**Purpose:** Record the protected admin team-list query and role-visibility invariants before any future refactor.

## Contract

`loadTeamList()` reads staff profiles through the profiles table, selects the required identity, role, status, creation, and activity fields, filters to administrators or moderators, and orders super administrators first, administrators second, and then by creation time.

Each staff row renders the escaped username, avatar, role badge and color, optional current-user marker, optional banned marker, full name, and last-seen fallback. Super administrators can manage every other staff member. Ordinary administrators can manage moderators only, not administrators or super administrators. Non-admin callers receive no management actions. The current user never receives a Manage action.

Empty staff results render a stable “No staff members” state. Query failures render a safe failure state. The list renderer itself does not execute any promotion, demotion, ban, notification, or account mutation.

## Harness coverage

`docs/admin-team-list-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Query construction | Staff filter and role ordering preserved | PASS |
| Role badges | Super admin, admin, and moderator badges render | PASS |
| Status markers | Current-user and banned markers render | PASS |
| Super-admin caller | Can manage other admins and moderators | PASS |
| Ordinary-admin caller | Can manage moderators only | PASS |
| Non-admin caller | Sees no Manage actions | PASS |
| Self protection | Current user never receives Manage | PASS |
| Activity fallback | Missing last-seen renders “Never active” | PASS |
| Empty results | Stable empty state renders | PASS |
| Query failure | Safe failure state renders | PASS |

The harness uses mocked DOM, database query builders, identity, escaping, and avatars only. It does not invoke real authentication, Supabase, promotion/demotion handlers, notifications, moderation, or account mutations.

## Safe boundary

The protected team-list renderer and all promotion, demotion, and staff-action handlers remain inline and unchanged. No production team-management or account code was moved or rewritten in this checkpoint.

## Validation

The standalone harness passed. The complete repository validation chain must pass before this contract and harness are published to `docs/`.

## References

1. [`index.html` admin team-list implementation](../index.html)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
