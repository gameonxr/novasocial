# NovaSocial Moderator Ban Recommendation Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-18
**Purpose:** Record the protected moderator ban-recommendation validation and submission invariants before any future refactor.

## Contract

`moderatorRecommendBan(targetUserId, targetUsername, reason, reportId)` permits only moderators, administrators, and super administrators. It rejects blank or whitespace-only reasons before database access. For an authorized caller with a valid reason, it trims the reason and inserts a pending `ban_approvals` record containing the moderator identity, target identity, user target type, optional report target ID, and pending status.

After a successful insert, the helper audits the recommendation, shows a success toast, and closes the modal. Insert failures are caught and surfaced through a failure toast without auditing or closing the modal. The recommendation helper does not directly ban the target account.

## Harness coverage

`docs/moderator-recommend-ban-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Authorized moderator | Trimmed pending payload is inserted | PASS |
| Payload shape | Moderator, target, user type, report ID, and pending status preserved | PASS |
| Success | Audit, success toast, and modal close occur | PASS |
| Blank reason | No database access; validation toast | PASS |
| Non-staff caller | No database access; authorization toast | PASS |
| Insert failure | Failure toast; no audit or close | PASS |

The harness uses mocked identity, role, database, audit, toast, and modal boundaries only. It does not invoke real authentication, Supabase, ban RPCs, notifications, moderation, or account mutations.

## Safe boundary

The protected recommendation submission and all approval, rejection, and ban handlers remain inline and unchanged. No production moderation or account code was moved or rewritten in this checkpoint.

## Validation

The standalone harness passed. The complete repository validation chain must pass before this contract and harness are published to `docs/`.

## References

1. [`index.html` moderator recommendation implementation](../index.html)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
