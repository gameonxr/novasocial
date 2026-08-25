# Protected moderation, admin, staff verification, and enforcement lifecycle — Protected Readiness Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-25
**Status:** `PREPARATION_ONLY`; production extraction remains `BLOCKED` until every gate below is independently approved.

## Scope and protected boundary

This dossier covers staff verification, admin role gates, user/report/appeal moderation, bans, deletes, audit context, and privileged UI navigation. It is a system-level preparation artifact, not a duplicate one-owner extraction contract. Existing helper-level contracts remain authoritative for already-approved owners and are not weakened by this document.

## Dependency map

staff verification, role/admin context, profile/account state, reports/appeals queries, moderation mutations, audit logging, privileged navigation, denial branches, and banned-state handling.

Protected source markers used by the detached inventory harness:
- `adminApproveAppeal`
- `adminRejectAppeal`

## Exact before/after parity boundary

Before/after must preserve role verification, ordinary-user denial, banned denial, fallback profile verification, query ordering, mutation authorization, audit context, destructive confirmation, error handling, and privileged navigation boundaries.

The parity comparison must use the immutable `origin/main` baseline and the Branch2 candidate snapshot. Any changed query, event, timer, global assignment, DOM mutation, storage key, media call, permission request, navigation transition, or cleanup sequence is a parity failure until explicitly authorized.

## Detached/browser-safe proof plan

Use detached role/profile/query/mutation/DOM mocks for admin, moderator, senior, super-admin, ordinary, banned, verification failure, query failure, and mutation failure. Browser-safe proof must never access a real staff account or perform moderation mutations.

Required evidence is synthetic and detached. A mock result is not production approval. Browser-safe evidence must record the shell state, mocked dependencies, expected events, forbidden side effects, and cleanup result without using a real account or live mutation.

## Rollback artifact

Pin moderation owner hashes and authorization traces; rollback restores inline privileged owners and removes only the external linkage. Re-run moderation, account, audit, and protected-parity gates.

The rollback artifact must pin the pre-split commit, source owner hash, script insertion/removal boundary, and post-rollback gate results. No production extraction is eligible without this artifact.

## Explicit feature authorization

Explicit authorization must define roles, verification sources, mutation permissions, audit requirements, destructive confirmation, denial UX, and rollback authority.

Authorization must be written against this exact system boundary. Authorization for a helper, control, or preparation harness does not authorize the protected system itself.

## Decision and non-goals

`EXACT_BEFORE_AFTER_PARITY=REQUIRED`
`DETACHED_BROWSER_SAFE_PROOF=REQUIRED`
`ROLLBACK_ARTIFACT=REQUIRED`
`EXPLICIT_FEATURE_AUTHORIZATION=REQUIRED`
`PRODUCTION_DECISION=BLOCKED`
`PRODUCTION_CHANGE=0`
`LIVE_SIDE_EFFECTS=0`
`BROWSER_LIVE_ACTIONS=0`

This dossier does not move code, change schema, authenticate, request permissions, upload media, send messages, mutate accounts, perform moderation, or alter protected accounting. It records what must be proven before a future minimal split can be considered.

## References

1. [`high-risk-seam-readiness-matrix-contract.md`](./high-risk-seam-readiness-matrix-contract.md)
2. [`protected-inline-parity-contract.md`](./protected-inline-parity-contract.md)
3. [`reversible-browser-proof-contract.md`](./reversible-browser-proof-contract.md)
4. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)
