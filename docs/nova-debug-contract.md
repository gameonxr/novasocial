# NovaSocial novaDebug Diagnostic Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-18
**Purpose:** Record the protected read-only diagnostic helper’s session guard, query boundaries, and error-isolation invariants before any future refactor.

## Contract

`novaDebug()` logs a diagnostic header and session state. When `ME.id` is absent, it logs a login warning and returns before any database access. With a valid session, it independently checks follows, the current user’s posts, the posts-with-profiles relationship, total post count, and profiles accessibility. Each diagnostic section catches its own query failure, logs the failure, and allows the remaining sections and final completion message to run.

The helper is read-only. It performs no writes, navigation, moderation, authentication transition, notification, media operation, or account mutation.

## Harness coverage

`docs/nova-debug-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| No session | Warning is logged and no database query runs | PASS |
| Follows check | Follows query boundary runs | PASS |
| Own posts check | Own-post query boundary runs | PASS |
| Profile join check | Joined post/profile query boundary runs | PASS |
| Profiles check | Profiles query boundary runs | PASS |
| Completion | Successful diagnostic logs completion | PASS |
| Error isolation | Query failures are logged without aborting later sections | PASS |

The harness uses mocked console, identity, database query builders, and window boundaries only. It does not invoke real authentication, Supabase, navigation, moderation, notifications, media, or account actions.

## Safe boundary

The protected `novaDebug()` implementation remains inline and unchanged. No production diagnostics, database, navigation, or account code was moved or rewritten in this checkpoint.

## Validation

The standalone harness passed. The complete repository validation chain must pass before this contract and harness are published to `docs/`.

## References

1. [`index.html` novaDebug implementation](../index.html)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
