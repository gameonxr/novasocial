# NovaSocial Saved-Account Schema Contract

**Repository:** `gameonxr/novasocial`
**Working branch:** `Branch2`
**Date:** 2026-08-19
**Purpose:** Preserve the local saved-account schema and token handoff used by Add Account, Switch Account, logout auto-transition, and avatar refresh.

## Contract

The `nova_accounts` local-storage value must remain a JSON array of account records containing `userId`, `username`, `avatarUrl`, `access_token`, `refresh_token`, and `savedAt`. The read helper must fall back to an empty array, account switching must restore both Supabase session tokens, and account-avatar refresh must update only the matching record's avatar field.

## Harness coverage

`docs/saved-account-schema-contract-harness.js` performs static assertions across the saved-account reader, account-switch action, avatar updater, and inline save/sync helpers. It does not access browser storage, call Supabase, or change account state.

| Check | Expected behavior | Result |
|---|---|---|
| Storage key | `nova_accounts` remains the single saved-account key | PASS |
| Record fields | Identity, avatar, both session tokens, and timestamp remain present | PASS |
| Read fallback | Invalid/missing storage falls back to `[]` | PASS |
| Token handoff | Switch path passes both access and refresh tokens to `setSession` | PASS |
| Record update | Avatar refresh targets the matching `userId` and preserves other fields | PASS |
| Bootstrap continuity | Inline save/sync helpers use the same schema | PASS |

## Safe boundary

This is a static, documentation-only audit. It does not log in, switch accounts, access credentials, or mutate local storage.

## References

1. [`account-bootstrap-contract.md`](./account-bootstrap-contract.md)
2. [`logout-account-transition-contract.md`](./logout-account-transition-contract.md)
3. [`src/features/switch-to-account.js`](../src/features/switch-to-account.js)

