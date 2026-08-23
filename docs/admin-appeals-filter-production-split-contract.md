
**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-23  
**Boundary:** `setAppealsFilter(f)` only

## Decision

The `setAppealsFilter(f)` owner is a contained read-only admin UI boundary. It updates the local `_appealsFilter` value, restyles the four existing appeal-filter controls, and delegates the resulting read to the existing `loadAppealsList()` owner. It does not insert, update, upsert, delete, call RPC, send notifications, upload, request permissions, mutate storage, navigate, or approve or reject an appeal.

The larger admin appeals surface remains outside this candidate. In particular, `loadAppealsList()` remains the existing inline read owner, while `adminApproveAppeal()` and `adminRejectAppeal()` remain inline state-changing owners. The split, if later authorized by all gates, must preserve the classic-script global `window.setAppealsFilter` API and must not alter those neighboring owners.

## Independent seam

The candidate harness defines an injected filter seam with local state, filter-control lookup, style application, and read-reload dependencies. It proves each supported filter (`pending`, `approved`, `rejected`, and `all`), selected/unselected styling, missing-control tolerance, and exactly one reload delegation. The seam is test-only and does not invoke Supabase, admin actions, notifications, storage, navigation, or live account data.

## Required gates

| Gate | Required evidence | Status |
|---|---|---|
| Exact owner parity | Candidate body SHA-256 equals the `origin/main` baseline | PASS |
| API compatibility | Inline owner remains during preparation; later split must expose one anonymous `window.setAppealsFilter` owner | Pending split |
| Independent seam | Injected filter/style/reload proof passes all four filters and missing-control branch | Pending |
| Read-only browser proof | Local synthetic admin-filter DOM proof with no live admin action | Pending |
| Rollback | Pre-split Branch2 commit and revert procedure are pinned | Pending |
| Focused gates | Candidate harness and affected static audits pass | Pending split |
| Full regression | Clean pushed Branch2 tip passes the complete gate | Pending split |

## Rollback

If any focused or full regression gate fails after a future split, revert the candidate commit identified by the companion rollback evidence, restore the inline `setAppealsFilter(f)` owner, and rerun the complete Branch2 gate before attempting another candidate.

## Safety boundary

No admin approve, reject, delete, unban, notification, report, appeal, message, follow, reaction, upload, download, permission, account, storage, or database action is performed. Browser proof may use only a synthetic local DOM and injected read-reload recorder; no live admin data or stateful control is touched.

## References

1. [`admin-appeals-filter-production-split-contract-harness.js`](./admin-appeals-filter-production-split-contract-harness.js)
2. [`admin-appeals-tab-contract.md`](./admin-appeals-tab-contract.md)
3. [`admin-appeals-tab-contract-harness.js`](./admin-appeals-tab-contract-harness.js)
4. [`high-risk-seam-readiness-matrix-contract.md`](./high-risk-seam-readiness-matrix-contract.md)
5. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
