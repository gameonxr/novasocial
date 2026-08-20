# NovaSocial Derive Video Thumbnail URL Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the structural invariants of the extracted pure Cloudinary poster-URL derivation helper.

## Contract

`_deriveVideoThumbnailUrl(videoUrl)` returns `null` for missing/non-string input, non-Cloudinary URLs, or URLs without `/video/upload/`. For valid Cloudinary video URLs, it changes the resource path to image delivery, inserts `so_0,f_jpg,q_auto:good,w_800,c_limit`, converts supported video extensions to `.jpg`, and returns the derived poster URL.

Unexpected derivation errors are caught, logged with the thumbnail prefix, and converted to `null`. The helper performs no DOM, storage, network, or media mutation work.

## Harness coverage

`docs/derive-video-thumbnail-url-contract-harness.js` validates input guards, Cloudinary/path validation, resource-type conversion, poster transform markers, supported extension conversion, error fallback, and pure scope.

The harness is deterministic and static. It does not generate URLs, contact Cloudinary, or load media.

## Safe boundary

The extracted `src/features/derive-video-thumbnail-url.js` module remains unchanged in this checkpoint. Protected media upload, playback, and deletion systems remain untouched.

## References

1. [`derive-video-thumbnail-url.js`](../src/features/derive-video-thumbnail-url.js)
2. [`generate-file-name-contract.md`](./generate-file-name-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

