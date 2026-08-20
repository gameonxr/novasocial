# NovaSocial Generate File Name Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the structural invariants of the extracted pure media filename generator.

## Contract

`_generateFileName(userId, mediaType)` builds a filename from a bounded user identifier, the current timestamp, and a six-character base-36 random component. It maps `video` media to `.mp4` and all other media types to `.webp`; absent user IDs use the `u` fallback.

The helper is pure with respect to application state: it performs no DOM, storage, network, database, or media mutation work.

## Harness coverage

`docs/generate-file-name-contract-harness.js` validates function ownership, user-ID fallback/truncation markers, timestamp/random components, video/non-video extension mapping, and pure scope.

The harness is deterministic and static. It does not generate filenames or access runtime randomness.

## Safe boundary

The extracted `src/features/generate-file-name.js` module remains unchanged in this checkpoint. Media upload and deletion systems remain untouched.

## References

1. [`generate-file-name.js`](../src/features/generate-file-name.js)
2. [`delete-multiple-media-contract.md`](./delete-multiple-media-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

