# NovaSocial Delete Multiple Media Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the structural seam of the extracted media-deletion orchestration helper without changing destructive production behavior.

## Contract

`deleteMultipleMediaProduction(mediaUrls, source, reason)` filters falsy media URLs and returns an empty array without delegation when no valid URLs remain. For valid URLs, it invokes `deleteMediaProduction(url, source, reason)` for each URL through `Promise.allSettled`, preserving per-item result visibility instead of failing fast.

This checkpoint is an audit only. The helper remains a high-risk deletion boundary: actual deletion, authorization, remote storage behavior, and caller policy remain outside this renderer-free orchestration contract and are not moved or modified.

## Harness coverage

`docs/delete-multiple-media-contract-harness.js` validates input normalization, empty-input guard, per-URL delegation shape, `Promise.allSettled` aggregation, and protected deletion ownership.

The harness is deterministic and static. It does not delete files, contact Cloudinary, mutate media records, or invoke destructive operations.

## Safe boundary

The extracted `src/features/delete-multiple-media.js` module remains unchanged in this checkpoint. No production deletion behavior is migrated, widened, or executed.

## References

1. [`delete-multiple-media.js`](../src/features/delete-multiple-media.js)
2. [`high-risk-extraction-gate-contract.md`](./high-risk-extraction-gate-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

