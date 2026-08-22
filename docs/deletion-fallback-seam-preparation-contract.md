# NovaSocial Deletion-Fallback Seam-Preparation Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Prepare, but do not execute, a reversible seam for local deletion fallback synchronization.

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

This is a **mapping-only checkpoint**. `syncLocalDeletionFallback()`, `deleteMediaProduction()`, local-storage access, queue replay, and startup trigger implementations remain inline and unchanged. Three non-destructive browser-context mock artifacts now cover malformed-storage failure, valid-queue replay, and empty-queue handling; they prove reversible mock behavior only and are not permission to extract production code. Before a split, the project still needs an explicit adapter seam, protected before/after marker parity, and reversible browser proof for the production split itself, including queue removal timing, storage failures, and startup invocation.

The first implementation step must be test-only or adapter-only and must preserve both `syncLocalDeletionFallback()` and `deleteMediaProduction()` owners until the complete seam harness passes.

## Harness coverage

`docs/deletion-fallback-seam-preparation-contract-harness.js` scans `index.html` and `src/` to confirm the fallback queue, storage, ordering, per-item isolation, finalization, startup guard, and media-deletion markers, the existing behavior contract/harness, the three passing non-destructive browser mock artifacts, and zero protected fallback production splits. It does not read real local storage, call Supabase or Cloudinary, replay deletion, or mutate account data.

| Check | Expected behavior | Result |
|---|---:|---|
| Fallback owner | `syncLocalDeletionFallback()` remains inline | PASS |
| Queue behavior | Queue key, stored order, item isolation, and finalization markers remain protected | PASS |
| Failure guards | Outer catch/logging and startup guard remain present | PASS |
| Media boundary | `deleteMediaProduction()` remains the cleanup owner | PASS |
| Browser mock inventory | Malformed-storage, valid-queue, and empty-queue artifacts are present with PASS markers | PASS |
| Production split | None | PASS |

## References

1. [`local-deletion-fallback-contract.md`](./local-deletion-fallback-contract.md)
2. [`local-deletion-fallback-contract-harness.js`](./local-deletion-fallback-contract-harness.js)
3. [`index.html`](../index.html)
4. [`deletion-fallback-browser-proof-evidence.txt`](./deletion-fallback-browser-proof-evidence.txt)
5. [`deletion-fallback-valid-queue-browser-proof-evidence.txt`](./deletion-fallback-valid-queue-browser-proof-evidence.txt)
6. [`deletion-fallback-empty-queue-browser-proof-evidence.txt`](./deletion-fallback-empty-queue-browser-proof-evidence.txt)
7. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

