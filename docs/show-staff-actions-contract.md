# NovaSocial Staff Actions Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-18
**Purpose:** Record the protected staff-management modal’s role-dependent rendering invariants before any future refactor.

## Contract

`showStaffActions(userId, username, currentRole, isSuper)` creates a management modal and renders actions from the caller’s live `PROF` role. The modal always includes a cancel action and safely escapes the displayed username and current role.

A super administrator managing an administrator receives actions to demote the target to moderator or remove administrator access. An ordinary administrator does not receive those administrator-management actions. A super administrator managing a moderator receives both promotion-to-administrator and removal actions. An ordinary administrator managing a moderator receives only the removal action. Unsupported roles receive a cancel-only modal.

The generated action handlers retain the target user ID and preserve the existing inline handler contract. The modal renderer itself does not perform a promotion, demotion, removal, RPC, notification, or account mutation.

## Harness coverage

`docs/show-staff-actions-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Super admin → administrator | Demote-to-moderator and remove-admin actions | PASS |
| Ordinary admin → administrator | Cancel-only action set | PASS |
| Super admin → moderator | Promote-to-admin and remove-moderator actions | PASS |
| Ordinary admin → moderator | Remove-moderator action only | PASS |
| Any caller → regular user | Cancel-only action set | PASS |
| Display safety | Username HTML-escaped and role normalized | PASS |
| Handler identity | Target user ID retained in generated handlers | PASS |

The harness evaluates the exact production function body inside mocked modal, role, escaping, and DOM boundaries. It does not invoke real authentication, Supabase, promotion/demotion RPCs, notifications, or account actions.

## Safe boundary

The protected `showStaffActions()` implementation and all moderator/admin mutation handlers remain inline and unchanged. No production admin-management code was moved or rewritten in this checkpoint.

## Validation

The standalone harness passed. The complete repository validation chain must pass before this contract and harness are published to `docs/`.

## References

1. [`index.html` staff actions implementation](../index.html)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
