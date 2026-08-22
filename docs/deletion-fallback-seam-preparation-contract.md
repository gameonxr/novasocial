# NovaSocial Deletion-Fallback Seam-Preparation Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the reversible seam and completed production split for local deletion fallback synchronization without broadening extraction to other protected systems.

## Preparation map

| Boundary | Current protected owner | Required seam input |
|---|---|---|
| Queue read | Inline `syncLocalDeletionFallback()` and `_mediaDeleteFallback` local-storage key | Adapter preserving outer read/parse guards and queue-preservation behavior on failure |
| Replay ordering | Inline stored-array iteration | Replay adapter preserving stored order and invoking `deleteMediaProduction(mediaUrl, source, reason)` for each item |
| Per-item isolation | Inline item-level `try/catch` | Failure-isolation seam ensuring one failed media deletion does not block later items |
| Queue finalization | Inline local-storage key removal after replay loop | Finalization seam removing the key after successful read/replay, including partial item failures, but not after outer read/parse failure |
| Media deletion | Inline `deleteMediaProduction()` boundary | Keep media/provider cleanup ownership stable; no alternate deletion implementation may be inferred |
| Startup trigger | Inline startup call guarded by function existence | Account/bootstrap seam preserving non-throwing startup behavior |

## Gate status

This is a **split-complete checkpoint**. `syncLocalDeletionFallback()` now resides in `src/features/sync-local-deletion-fallback.js` as the sole `window.syncLocalDeletionFallback` owner, while `deleteMediaProduction()` remains inline and the startup caller remains unchanged. Five non-destructive browser-context proof artifacts cover malformed-storage failure, valid-queue replay, empty-queue handling, disposable inline-versus-adapter comparison, and the after-split production smoke. The production split passed protected before/after parity, exact owner hash, load order, queue removal timing, storage-failure behavior, startup invocation, and rollback proof.

The production owner move was performed only after the test-only adapter comparison passed. The module preserves the global startup handoff and delegates media cleanup to the existing inline `deleteMediaProduction()` boundary.

## Harness coverage

`docs/deletion-fallback-seam-preparation-contract-harness.js` scans `index.html` and `src/` to confirm the fallback queue, storage, ordering, per-item isolation, finalization, startup guard, and media-deletion markers, the existing behavior contract/harness, six passing non-destructive browser proof artifacts, the completed module owner, and preserved startup handoff. It does not read real local storage, call Supabase or Cloudinary, replay deletion, or mutate account data.

| Check | Expected behavior | Result |
|---|---:|---|
| Fallback owner | `src/features/sync-local-deletion-fallback.js` assigns one `window.syncLocalDeletionFallback` owner | PASS |
| Queue behavior | Queue key, stored order, item isolation, and finalization markers remain protected | PASS |
| Failure guards | Outer catch/logging and startup guard remain present | PASS |
| Media boundary | `deleteMediaProduction()` remains the cleanup owner | PASS |
| Browser mock inventory | Malformed-storage, valid-queue, empty-queue, disposable comparison, and after-split production artifacts are present with PASS markers | PASS |
| Production split | Complete; module loads before `like-effects.js`, global startup handoff is preserved, and rollback is proven | PASS |

## References

1. [`local-deletion-fallback-contract.md`](./local-deletion-fallback-contract.md)
2. [`local-deletion-fallback-contract-harness.js`](./local-deletion-fallback-contract-harness.js)
3. [`index.html`](../index.html)
4. [`deletion-fallback-browser-proof-evidence.txt`](./deletion-fallback-browser-proof-evidence.txt)
5. [`deletion-fallback-valid-queue-browser-proof-evidence.txt`](./deletion-fallback-valid-queue-browser-proof-evidence.txt)
6. [`deletion-fallback-empty-queue-browser-proof-evidence.txt`](./deletion-fallback-empty-queue-browser-proof-evidence.txt)
7. [`deletion-fallback-browser-comparison-proof-evidence.txt`](./deletion-fallback-browser-comparison-proof-evidence.txt)
8. [`deletion-fallback-after-split-browser-proof-evidence.txt`](./deletion-fallback-after-split-browser-proof-evidence.txt)
9. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

