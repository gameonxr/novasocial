# Protected creation, upload, media processing, and deletion lifecycle — Protected Readiness Contract

**Repository:** `gameonxr/novasocial`
**Branch:** `Branch2` only
**Date:** 2026-08-25
**Status:** `PREPARATION_ONLY`; production extraction remains `BLOCKED` until every gate below is independently approved.

## Scope and protected boundary

This dossier covers post/Story/Note creation, image/video/audio upload, compression/thumbnail processing, Cloudinary/Supabase persistence, and media deletion. It is a system-level preparation artifact, not a duplicate one-owner extraction contract. Existing helper-level contracts remain authoritative for already-approved owners and are not weakened by this document.

## Dependency map

file inputs, compression/canvas, thumbnail derivation, upload providers, media metadata, database inserts/updates, local queues, retry/fallback paths, and deletion cleanup across posts/Stories/Notes.

Protected source markers used by the detached inventory harness:
- `deleteMediaProduction`
- `compressImage`

## Exact before/after parity boundary

Before/after must preserve file validation, MIME/size limits, compression quality, upload ordering, metadata, database persistence, retry queues, partial failure behavior, deletion authorization, provider cleanup, and rollback of optimistic UI.

The parity comparison must use the immutable `origin/main` baseline and the Branch2 candidate snapshot. Any changed query, event, timer, global assignment, DOM mutation, storage key, media call, permission request, navigation transition, or cleanup sequence is a parity failure until explicitly authorized.

## Detached/browser-safe proof plan

Use detached File/canvas/provider/DB/queue mocks for empty, invalid, compression bypass, upload failure, insert failure, partial deletion, retry, and cleanup branches. Browser-safe proof must never select real files, upload media, or delete remote assets.

Required evidence is synthetic and detached. A mock result is not production approval. Browser-safe evidence must record the shell state, mocked dependencies, expected events, forbidden side effects, and cleanup result without using a real account or live mutation.

## Rollback artifact

Pin upload/delete owner hashes and provider call traces; rollback restores inline creation/media owners and removes only the external linkage. Re-run media, storage, upload, deletion, and protected gates.

The rollback artifact must pin the pre-split commit, source owner hash, script insertion/removal boundary, and post-rollback gate results. No production extraction is eligible without this artifact.

## Explicit feature authorization

Explicit authorization must define supported media types, size/quality policy, provider/schema ownership, retry/queue behavior, deletion scope, privacy, and rollback authority.

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
