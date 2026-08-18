# NovaSocial Notification Dispatch Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-18
**Purpose:** Record the protected preference-aware notification dispatch invariants as a standalone contract before any future refactor.

## Contract

`sendNotif(recipientId, type, extra)` is a best-effort notification helper. It suppresses empty recipients and self-notifications immediately. It suppresses delivery when the recipient has blocked the current user. For notification types mapped in `NOTIF_PREF_MAP`, it calls the preference RPC and suppresses delivery when the recipient has opted out.

Block lookup and preference RPC failures are tolerated so a transient lookup issue does not prevent the notification attempt. The inserted payload maps recipient ID, current sender ID, notification type, optional post/comment/conversation/story IDs, and message text, using null or an empty string for absent optional values. Notification insert failures are caught at the helper boundary and do not propagate to the calling feature.

## Harness coverage

`docs/notification-dispatch-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Empty recipient | Suppress notification | PASS |
| Self recipient | Suppress notification | PASS |
| Blocked recipient | Suppress notification | PASS |
| Preference opt-out | Suppress mapped notification | PASS |
| Successful dispatch | Map payload fields and insert | PASS |
| Block lookup failure | Continue to preference/insert path | PASS |
| Preference RPC failure | Continue to insert path | PASS |
| Notification insert failure | Swallow failure at helper boundary | PASS |

The harness is deterministic and uses mocked block, preference, notification, and payload events only. It does not invoke real DOM, Supabase, authentication, notifications, push services, profiles, or account actions.

## Safe boundary

The protected `sendNotif()` implementation, preference map, block check, and notification database boundary remain inline and unchanged. No notification or push production code was moved or rewritten in this checkpoint.

## Validation

The standalone harness passed. The complete repository validation chain also passed, including all JavaScript syntax checks, HTML/script integration checks, every `/tmp/validate_*.py` contract validator, inline application-script syntax validation, whitespace checks, protected-function markers, script load order, Branch2 verification, and confirmation that `origin/main` remained unchanged.

## References

1. [`index.html` notification dispatch implementation](../index.html)
2. [`CRITICAL_CONTEXT.md`](../../upload/CRITICAL_CONTEXT.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
