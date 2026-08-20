# NovaSocial Optimize Cloudinary URL Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the structural invariants of the extracted Cloudinary delivery quality optimizer.

## Contract

`optimizeCloudinaryUrl(url)` returns the original value for missing/non-string input, non-Cloudinary URLs, video URLs, and `good` connection quality. For `low` quality it selects `q_auto:low,f_auto`; otherwise it selects `q_auto:eco,f_auto`.

The helper bails out on unexpected upload structure, replaces existing quality transforms while retaining other transform parameters, and inserts a fresh transform segment when none exists. It performs URL transformation only; it does not upload, download, persist, or mutate media.

## Harness coverage

`docs/optimize-cloudinary-url-contract-harness.js` validates input/provider guards, video passthrough, quality mapping, upload-marker guard, existing-transform replacement, fresh insertion, and pure scope.

The harness is deterministic and static. It does not inspect connection state, call Cloudinary, or load media.

## Safe boundary

The extracted `src/features/optimize-cloudinary-url.js` module remains unchanged in this checkpoint. Protected media delivery, upload, playback, and deletion systems remain untouched.

## References

1. [`optimize-cloudinary-url.js`](../src/features/optimize-cloudinary-url.js)
2. [`cld-url-contract.md`](./cld-url-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

