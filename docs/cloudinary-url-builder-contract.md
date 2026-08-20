# NovaSocial Cloudinary URL-Builder Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Freeze the existing Cloudinary delivery URL behavior used by media display and video poster generation.

## Contract

The pure `cldUrl(url, transform)` helper inserts a requested transform only into URLs containing the Cloudinary `/upload/` marker, and otherwise returns the original value. The `optimizeCloudinaryUrl(url)` helper preserves non-Cloudinary URLs and video delivery URLs, leaves good-connection URLs unchanged, and applies the current low/medium connection quality transform policy without discarding an existing non-quality transform segment. The `_deriveVideoThumbnailUrl(videoUrl)` helper converts Cloudinary video delivery to an image poster URL using `so_0,f_jpg,q_auto:good,w_800,c_limit` and changes supported video extensions to `.jpg`.

These rules are delivery-time URL transformations only. They do not modify stored media URLs, upload configuration, Cloudinary credentials, database records, or protected inline media systems.

## Harness coverage

`docs/cloudinary-url-builder-contract-harness.js` loads the three pure helper modules in an isolated VM context and tests representative valid, passthrough, quality, and poster-derivation cases. The harness does not access the network, authenticate, call Cloudinary, mutate Supabase, or execute the full application.

| Check | Expected behavior | Result |
|---|---|---|
| `cldUrl` transform insertion | Insert a transform after `/upload/` for a Cloudinary delivery URL | PASS |
| `cldUrl` passthrough | Preserve non-Cloudinary/unexpected URLs and empty transforms | PASS |
| Quality optimizer | Preserve good connections and apply current low/medium policies | PASS |
| Video passthrough | Do not apply image optimization to `/video/upload/` URLs | PASS |
| Video poster derivation | Produce an image URL with first-frame, JPG, quality, and size transforms | PASS |
| Invalid poster input | Return `null` for non-Cloudinary or non-video input | PASS |

## Safe boundary

No production logic is changed by this audit. The contract only exercises existing pure helpers in isolation and records their current behavior. Any future change to transformation policy, URL parsing, or video poster dimensions requires a separate compatibility review.

## References

1. [`src/features/cld-url.js`](../src/features/cld-url.js)
2. [`src/features/optimize-cloudinary-url.js`](../src/features/optimize-cloudinary-url.js)
3. [`src/features/derive-video-thumbnail-url.js`](../src/features/derive-video-thumbnail-url.js)
4. [`index.html`](../index.html)

