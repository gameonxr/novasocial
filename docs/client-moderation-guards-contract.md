# NovaSocial Client Moderation Guards Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the extracted client moderation guard helpers.

## Contract

`isBannedClient()` returns `true` and emits the suspended-account toast when `PROF.is_banned === true`; otherwise it returns `false` without feedback.

`isMsgBannedClient()` returns `true` and emits the message-restriction toast when `PROF.is_msg_banned === true`; otherwise it returns `false` without feedback. Both functions guard access through the existing `PROF` check and do not mutate profile state, perform network requests, or submit moderation actions.

The harness is static and documentation-only. It does not evaluate profile flags or emit toasts.

## Harness coverage

`docs/client-moderation-guards-contract-harness.js` validates both signatures, profile guards, exact flags, exact toast messages, true/false return paths, and side-effect boundaries.

## References

1. [`client-moderation-guards.js`](../src/features/client-moderation-guards.js)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

