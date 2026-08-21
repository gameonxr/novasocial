# NovaSocial Compress Image Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the browser image-compression helper without processing user media.

## Contract

`_compressImage(file, config)` returns the original file immediately when it is smaller than 200 KB. For larger files, it creates a canvas and image object, revokes the object URL after load or error, and scales dimensions down only when they exceed `config.maxWidth` or `config.maxHeight`, defaulting each to 1080.

It fills the canvas black, draws the image, selects `config.outputFormat` or `image/webp`, and computes a maximum size from `config.maxSizeMB` or 1.5 MB. The recursive quality loop starts at `config.quality` or 0.82, reduces quality by 0.08 while blobs exceed the target and quality remains above 0.45, and resolves a generated `File` using `_generateFileName(ME?.id, 'image')`. Null blobs and image errors resolve the original file.

The harness is static and documentation-only. It does not create object URLs, decode images, write blobs, or process media.

## Harness coverage

`docs/compress-image-contract-harness.js` validates the small-file bypass, browser primitives, URL revocation, dimension defaults and scaling, output format and size defaults, recursive quality thresholds, generated filename, and original-file fallbacks.

## References

1. [`compress-image.js`](../src/features/compress-image.js)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

