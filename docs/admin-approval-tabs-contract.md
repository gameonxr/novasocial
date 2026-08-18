# NovaSocial Admin Approval Tabs Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-18
**Purpose:** Record the protected admin pending-approval and moderator-request-history invariants before any future refactor.

## Contract

`adminTabApprovals(content)` renders a pending ban-approval list and reads up to 50 `ban_approvals` records with `status = 'pending'`, newest first. Each item renders the recommending moderator, target profile, target’s existing-ban marker when applicable, escaped recommendation reason, and Approve Ban and Reject actions carrying the approval and target identities. Empty results and query failures render stable safe states.

`adminTabMyApprovals(content)` renders the current moderator’s own recommendation history, filtering by `ME.id` and reading up to 50 records newest first. Each item renders the target profile, status-specific color, escaped recommendation reason, optional escaped admin notes, and creation time. Empty results and failures render stable safe states.

The tab renderers do not execute approval, rejection, ban, notification, audit, or account mutations.

## Harness coverage

`docs/admin-approval-tabs-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Pending admin list | Pending query and newest-first boundary render | PASS |
| Moderator identity | Recommending moderator renders | PASS |
| Target identity | Target profile and existing-ban marker render | PASS |
| Safety | Recommendation reason is escaped | PASS |
| Pending actions | Approve and reject handlers preserve IDs | PASS |
| Admin empty/failure | Stable empty and failure states render | PASS |
| Own-request filter | Current moderator ID is applied | PASS |
| Own-request status | Status and color render | PASS |
| Own-request notes | Reason and admin notes are escaped | PASS |
| Own empty/failure | Stable empty and failure states render | PASS |

The harness uses mocked DOM, database query builders, identity, escaping, and avatars only. It does not invoke real authentication, Supabase, ban RPCs, approval/rejection handlers, notifications, audit logging, or account mutations.

## Safe boundary

The protected approval-tab renderers and all approve, reject, ban, notification, audit, and authorization handlers remain inline and unchanged. No production approval or account code was moved or rewritten in this checkpoint.

## Validation

The standalone harness passed. The complete repository validation chain must pass before this contract and harness are published to `docs/`.

## References

1. [`index.html` admin approval-tab implementation](../index.html)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
