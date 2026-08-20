# NovaSocial Mutation Error-Boundary Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Prevent modularization or formatting changes from removing the explicit Supabase error boundary required by rate limits and server-side policy triggers.

## Contract

The critical user mutations `sendCmt()`, `submitCreate()`, `sendMsg()`, `blockUser()`, and `unblockUser()` must retain `.throwOnError()` on their primary insert/delete operation. Supabase-JS can return database rejection information without throwing unless this boundary is chained; removing it can make a rate-limit, block-enforcement, or policy failure look like a successful action.

`sendCmt()` must stop before notification and comment refresh when its insert fails, while the other actions must retain their existing catch/rollback or failure-toast behavior. This contract audits only the presence and table-specific placement of the error boundary. It does not change queries, error messages, optimistic UI, block semantics, or protected call sites.

## Harness coverage

`docs/mutation-error-boundary-contract-harness.js` scans the current source locations for the five critical functions and asserts that each primary mutation targets the expected table and retains `.throwOnError()`. It also verifies the comments module remains referenced by `index.html` and that the AI moderation wrapper still references `window.sendCmt`. The harness is static and does not call Supabase, authenticate, send content, mutate blocks, or execute the app.

| Critical action | Primary mutation | Error boundary | Result |
|---|---|---|---|
| `sendCmt()` | `comments` insert | `.throwOnError()` | PASS |
| `submitCreate()` | `posts` insert | `.throwOnError()` | PASS |
| `sendMsg()` | `messages` insert | `.throwOnError()` | PASS |
| `blockUser()` | `blocks` insert | `.throwOnError()` | PASS |
| `unblockUser()` | `blocks` delete | `.throwOnError()` | PASS |

## Safe boundary

No production logic is changed by this audit. The contract records a load-bearing error-handling invariant so a future high-risk seam or extraction cannot silently remove it.

## References

1. [`src/features/comments.js`](../src/features/comments.js)
2. [`index.html`](../index.html)
3. [`src/features/ai-moderation.js`](../src/features/ai-moderation.js)
4. [`CRITICAL_CONTEXT.md`](../../upload/CRITICAL_CONTEXT.md)
5. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

