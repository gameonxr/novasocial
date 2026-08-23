# Refresh Profile Counts Production-Split Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-23  
**Boundary:** `refreshProfileCounts(userId)` only

## Decision

`refreshProfileCounts(userId)` is a candidate contained read-only profile-count owner. It performs two `profiles` reads in parallel: one for the target user's `followers_count` and one for the current account's `following_count`. It then updates only the existing `followers-count` and `following-count` DOM elements, preserving raw values in `dataset.raw` and formatted values through the existing `fmt()` helper. Its error boundary is intentionally silent, matching the current inline behavior.

This candidate does not insert, update, upsert, delete, invoke RPC, send notifications, upload, request permissions, mutate storage, navigate, change follow state, or own the neighboring `toggleFollowProfile(userId)` mutation. The single existing caller remains the follow-profile flow, and the candidate package does not authorize extraction of that state-changing owner.

## Independent seam

The companion harness defines an injected read/render seam for both profile-count queries, formatting, and optional DOM targets. It proves the normal two-result branch, target-only and current-account-only branches, missing-DOM tolerance, and query-failure swallowing. The seam is test-only and performs no Supabase call, follow mutation, storage mutation, navigation, notification, or live-account action.

## Required gates

| Gate | Required evidence | Status |
|---|---|---|
| Exact owner parity | Candidate body SHA-256 equals the `origin/main` baseline | PASS |
| Read-only classification | No mutation, messaging, permission, storage, or navigation boundary in owner body | PASS |
| Caller scope | One existing read-only delegation from the follow-profile flow | PASS |
| Independent seam | Injected two-query/read-render cases pass | PASS |
| Browser proof | Detached synthetic profile-count DOM proof with no live follow action | PASS |
| Rollback | Pre-split Branch2 commit and revert procedure pinned | PASS |
| Focused gates | Candidate preparation harness and neighboring profile/follow audits | Pending after production split |
| Full regression | Clean pushed Branch2 tip after any approved split | Not started |

## Production decision

No production extraction is authorized by this preparation document alone. A production split may proceed only after exact owner parity, independent seam evidence, read-only browser proof, rollback evidence, focused gates, and a clean full Branch2 regression package are complete. The adjacent follow mutation and all protected high-risk systems remain blocked.

## Browser safety boundary

Browser proof may use only detached synthetic DOM nodes and injected query/format dependencies. It must not open or activate live follow controls, send messages, create reactions, change account state, mutate storage or database state, navigate through stateful controls, or use live profile data.

## References

1. [`refresh-profile-counts-production-split-contract-harness.js`](./refresh-profile-counts-production-split-contract-harness.js)
2. [`admin-appeals-filter-production-split-contract.md`](./admin-appeals-filter-production-split-contract.md)
3. [`follow-list-contract.md`](./follow-list-contract.md)
4. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
5. [`high-risk-seam-readiness-matrix-contract.md`](./high-risk-seam-readiness-matrix-contract.md)

