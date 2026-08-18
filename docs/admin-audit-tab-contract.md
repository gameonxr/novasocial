# NovaSocial Admin Audit Tab Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-18
**Purpose:** Record the protected admin audit-tab loading and rendering invariants before any future refactor.

## Contract

`adminTabAudit(content)` treats `audit_logs` as the source of truth and requests the newest 100 entries. When that source returns no entries or is unavailable, the helper falls back to `admin_actions`, also limited to the newest 100 entries. The rendered source indicator identifies whether the primary or fallback table supplied the entries.

Audit entries are normalized across the two source schemas and rendered with human-readable action labels, category-specific colors, optional non-success status badges, optional non-user actor-role badges, target type and truncated target ID, escaped notes, optional IP address, actor avatar, actor username, and localized creation time. Unknown action types fall back to an underscore-spaced label and the default color. When both sources contain no entries, the helper renders the stable “No audit entries found” state.

The audit renderer is read-only: it does not execute any admin action, RPC, notification, moderation operation, or account mutation.

## Harness coverage

`docs/admin-audit-tab-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Primary source | `audit_logs` is queried first | PASS |
| Primary success | Fallback is skipped when entries exist | PASS |
| Known action | Human label and category color render | PASS |
| Status badge | Non-success status renders | PASS |
| Role badge | Non-user actor role renders | PASS |
| Target metadata | Type and truncated ID render | PASS |
| Safe metadata | Notes are escaped and IP renders | PASS |
| Fallback | `admin_actions` is used after primary failure/empty | PASS |
| Fallback rendering | Fallback source and labels render | PASS |
| Empty sources | Stable empty state renders | PASS |

The harness uses mocked database query builders, content, escaping, and avatars only. It does not invoke real authentication, Supabase, RLS, admin actions, notifications, moderation, or account mutations.

## Safe boundary

The protected `adminTabAudit()` implementation remains inline and unchanged. No production audit-log, admin-action, moderation, or account code was moved or rewritten in this checkpoint.

## Validation

The standalone harness passed. The complete repository validation chain must pass before this contract and harness are published to `docs/`.

## References

1. [`index.html` admin audit implementation](../index.html)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
