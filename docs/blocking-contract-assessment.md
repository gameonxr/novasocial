# NovaSocial Blocking Contract Assessment

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-18
**Purpose:** Record the safe, mocked blocking seam before any protected block mutation is reconsidered.

## Contract

NovaSocial intentionally has two different blocking semantics. Content visibility uses a bidirectional set containing users I blocked and users who blocked me. The Block/Unblock button uses a one-direction set containing only users I blocked. These semantics must not be merged.

Content-gating paths must hide a target when either direction is present. The button must show `Unblock` only when the current user blocked the target and must continue to show `Block` when only the other user blocked the current user.

Block mutations must preserve `.throwOnError()` so duplicate or server/RLS failures are not silently swallowed. The UI may handle the resulting error, but the mutation contract must surface it.

## Mock harness result

`/tmp/blocking_contract_harness.js` and the Branch2 documentation copy validate a three-way bidirectional union, both content-gating directions, one-direction button semantics, a successful mutation, and duplicate-error propagation through `.throwOnError()`. The deterministic harness passed without invoking a real block, unblock, database, or account action.

## Safe boundary

No protected block mutation was moved or rewritten. The next code-level blocking change would require testing both directions across profile shell gating, profile actions, feed/explore/search filtering, messages, and server-side enforcement. Until that matrix exists, the current externalized reader and inline mutation paths remain unchanged.

## References

1. [Critical runtime safeguards](file:///home/ubuntu/upload/CRITICAL_CONTEXT.md)
2. [Bidirectional blocked-user reader](file:///home/ubuntu/novasocial/src/features/get-blocked-both-ways-set.js)
3. [Current migration map](file:///home/ubuntu/novasocial/MIGRATION_MAP.md)
