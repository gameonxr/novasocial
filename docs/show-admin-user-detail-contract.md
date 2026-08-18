# NovaSocial Admin User Detail Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-18
**Purpose:** Record the protected admin user-detail modal’s read and rendering invariants before any future refactor.

## Contract

`showAdminUserDetail(userId)` opens the user-details modal, renders a loading state, and performs the profile read and post-count read in parallel. A profile query error renders a safe failure state. A missing profile renders the stable “User not found” state and does not continue to report loading.

For a found profile, the modal renders escaped identity fields, role/status badges, post and follower counts, joined date, and conditional ban/message-ban reasons. Non-self users receive status-dependent admin action buttons for account bans, messaging restrictions, and administrator promotion/demotion. The current user is explicitly protected from all such actions and receives a no-actions message.

After the main profile view is rendered, the helper delegates report-history loading to `loadUserReportStats(userId)`. The detail renderer itself does not execute any admin mutation or report action.

## Harness coverage

`docs/show-admin-user-detail-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Found non-self user | Render profile, status, counts, actions, and reports placeholder | PASS |
| Parallel reads | Profile and post-count query boundaries preserved | PASS |
| Escaping | Identity and ban reason are safely escaped | PASS |
| Banned user | Unban action and ban reason render | PASS |
| Unrestricted messaging | Message-ban action renders | PASS |
| Non-admin user | Promote-to-admin action renders | PASS |
| Self-view | All admin actions hidden; protected no-actions state shown | PASS |
| Missing profile | Stable not-found state; no report delegation | PASS |
| Profile failure | Safe failure state | PASS |
| Report delegation | `loadUserReportStats` receives the target ID after rendering | PASS |

The harness evaluates the exact production function body inside mocked modal, database, identity, escaping, icon, avatar, and report-loader boundaries. It does not invoke real authentication, Supabase, admin RPCs, notifications, moderation actions, or account mutations.

## Safe boundary

The protected `showAdminUserDetail()` implementation, `loadUserReportStats()`, and all admin mutation handlers remain inline and unchanged. No production admin detail, report, ban, messaging restriction, or role-management code was moved or rewritten in this checkpoint.

## Validation

The standalone harness passed. The complete repository validation chain must pass before this contract and harness are published to `docs/`.

## References

1. [`index.html` admin user-detail implementation](../index.html)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
