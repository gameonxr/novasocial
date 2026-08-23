# `setVerifyFilter` Production Split Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-23  
**Purpose:** Define the narrow, reversible boundary for extracting the admin verification filter owner without moving verification reads, identity-proof rendering, approval/rejection actions, notifications, moderation, or account state.

## Candidate boundary

`setVerifyFilter(filter)` updates the existing `_verifyFilter` value, applies the selected filter’s existing color and border styling to the detached `vf-*` controls, resets the remaining controls, and delegates exactly one reload to the existing `loadVerifyList()` owner.

The candidate owns no database query, verification status update, identity-proof handling, notification, moderation, navigation, authentication, storage, or account operation. `adminTabVerify()`, `loadVerifyList()`, `adminApproveVerify()`, `adminRejectVerify()`, and all other verification handlers remain inline and unchanged.

## Preparation status

| Gate | Required evidence | Status |
|---|---|---|
| Exact owner parity | Normalized owner matches immutable `origin/main` | PASS |
| Caller boundary | Four verification filter controls call the owner; reload remains delegated | PASS |
| Read-only classification | No database or state-changing operation is owned | PASS |
| Injected seam | Four filters plus missing-control behavior pass deterministically | PASS |
| Browser proof | Detached synthetic DOM only; no live admin action or query | PASS |
| Rollback | Pre-split Branch2 SHA and restoration procedure pinned | PASS |
| Production split | Anonymous classic global owner linked after its caller dependencies | PASS |
| Focused gates | Candidate and neighboring admin verification harnesses pass after split | PASS |
| Full regression | Clean pushed Branch2 tip after split | Pending |

## Safe boundary

Only the verification filter owner may move. The production split must preserve the classic-script global API as exactly one anonymous `window.setVerifyFilter = function(f) { ... }` assignment, with no ES-module conversion, `defer`, `async`, or live browser mutation. Verification reads and all approval/rejection actions remain outside the extracted scope.

## References

1. [`index.html`](../index.html)
2. [`admin-verification-tab-contract.md`](admin-verification-tab-contract.md)
3. [`admin-verification-tab-contract-harness.js`](admin-verification-tab-contract-harness.js)
4. [`set-verify-filter-production-split-contract-harness.js`](set-verify-filter-production-split-contract-harness.js)
5. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
