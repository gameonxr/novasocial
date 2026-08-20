# NovaSocial Cloudinary URL Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the structural invariants of the extracted pure Cloudinary transform URL helper.

## Contract

`cldUrl(url, transform)` returns the original value for missing/non-string input, URLs without `/upload/`, or absent transforms. For valid upload URLs with a transform, it inserts `${transform}/` immediately after `/upload/` and returns the transformed URL.

The helper is pure and performs no DOM, storage, network, database, or media mutation work.

## Harness coverage

`docs/cld-url-contract-harness.js` validates passthrough guards, upload-path validation, transform insertion, and pure scope.

The harness is deterministic and static. It does not construct URLs or contact Cloudinary.

## Safe boundary

The extracted `src/features/cld-url.js` module remains unchanged in this checkpoint. Protected media upload and delivery systems remain untouched.

## References

1. [`cld-url.js`](../src/features/cld-url.js)
2. [`derive-video-thumbnail-url-contract.md`](./derive-video-thumbnail-url-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

