# NovaSocial Admin Verification Tab Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-18
**Purpose:** Record the protected verification-tab filtering and rendering invariants before any future refactor.

## Contract

`adminTabVerify(content)` renders pending, approved, rejected, and all filter controls, creates the verification-list loading state, and delegates the initial read to `loadVerifyList()`.

`setVerifyFilter(filter)` updates `_verifyFilter`, styles the selected filter, resets the remaining controls, and reloads the list. `loadVerifyList()` reads up to 50 verification requests in descending creation order. Every filter except `all` applies a status equality constraint; `all` omits it.

Each request renders the embedded profile identity, status color, applicant name/category, escaped reason, and an optional ID-proof link. Pending requests render approve and reject actions that preserve the request ID, user ID, and escaped username. Approved, rejected, and other non-pending requests do not render those pending-only actions. Empty results and query failures render stable safe states.

## Harness coverage

`docs/admin-verification-tab-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Tab initialization | Four filters and list container render | PASS |
| Pending filter | Status equality query is applied | PASS |
| Approved filter | Selected styling applies and actions are hidden | PASS |
| All filter | Status equality query is omitted | PASS |
| Embedded profile | Username and avatar render | PASS |
| Safe reason rendering | Applicant reason is escaped | PASS |
| ID proof | Link renders only when supplied | PASS |
| Pending actions | Approve and reject actions render with IDs | PASS |
| Empty results | Filter-aware empty state renders | PASS |
| Query failure | Safe failure state renders | PASS |

The harness uses mocked DOM, database query builders, escaping, and avatars only. It does not invoke real authentication, Supabase, verification RPCs, notifications, uploads, or account mutations.

## Safe boundary

The protected verification-tab functions and all approval/rejection handlers remain inline and unchanged. No production verification, identity-proof, notification, or account code was moved or rewritten in this checkpoint.

## Validation

The standalone harness passed. The complete repository validation chain must pass before this contract and harness are published to `docs/`.

## References

1. [`index.html` admin verification implementation](../index.html)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
