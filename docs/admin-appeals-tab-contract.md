# NovaSocial Admin Appeals Tab Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-18
**Purpose:** Record the protected ban-appeals-tab filtering and rendering invariants before any future refactor.

## Contract

`adminTabAppeals(content)` renders pending, approved, rejected, and all filter controls, creates the appeals-list loading state, and delegates the initial read to `loadAppealsList()`.

`setAppealsFilter(filter)` updates `_appealsFilter`, styles the selected filter, resets the remaining controls, and reloads the list. `loadAppealsList()` reads up to 50 ban appeals in descending creation order. Every filter except `all` applies a status equality constraint; `all` omits it.

Each appeal renders the embedded profile identity, status, optional ban reason, and escaped appeal reason. Pending appeals render approve/unban and reject actions that preserve the appeal ID, user ID, and escaped username. Approved, rejected, and other non-pending appeals do not render those pending-only actions. Empty results and query failures render stable safe states.

## Harness coverage

`docs/admin-appeals-tab-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Tab initialization | Four filters and list container render | PASS |
| Pending filter | Status equality query is applied | PASS |
| Approved filter | Selected styling applies and actions are hidden | PASS |
| All filter | Status equality query is omitted | PASS |
| Embedded profile | Username and avatar render | PASS |
| Ban reason | Present reason is escaped and shown | PASS |
| Appeal reason | Reason is escaped | PASS |
| Pending actions | Approve/unban and reject actions render with IDs | PASS |
| Empty results | Filter-aware empty state renders | PASS |
| Query failure | Safe failure state renders | PASS |

The harness uses mocked DOM, database query builders, escaping, and avatars only. It does not invoke real authentication, Supabase, appeal-resolution RPCs, notifications, unban operations, or account mutations.

## Safe boundary

The protected appeals-tab functions and all appeal approval/rejection, unban, notification, and authorization handlers remain inline and unchanged. No production appeals code was moved or rewritten in this checkpoint.

## Validation

The standalone harness passed. The complete repository validation chain must pass before this contract and harness are published to `docs/`.

## References

1. [`index.html` admin appeals implementation](../index.html)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
