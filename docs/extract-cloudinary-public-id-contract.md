# NovaSocial Extract Cloudinary Public ID Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the structural invariants of the extracted Cloudinary delivery URL parser.

## Contract

`extractCloudinaryPublicId(url)` returns `null` for missing URLs or URLs that do not contain `cloudinary.com`. It splits at `/upload/`, returns `null` when the delivery path is absent, removes a leading version segment matching `v<digits>/`, strips the final extension, and returns the remaining public ID path. Unexpected parser errors are converted to `null`.

The helper owns parsing only. It does not delete files, write tracking records, call Supabase, access the DOM, or perform network requests. The adjacent deletion comments are documented context, not executable behavior.

## Harness coverage

`docs/extract-cloudinary-public-id-contract-harness.js` validates URL/provider guards, upload-path extraction, version removal, extension stripping, null fallback, and parser-only scope.

The harness is deterministic and static. It does not contact Cloudinary or invoke deletion behavior.

## Safe boundary

The extracted `src/features/extract-cloudinary-public-id.js` module remains unchanged in this checkpoint. Cloudinary deletion, media tracking, and protected storage systems remain untouched.

## References

1. [`extract-cloudinary-public-id.js`](../src/features/extract-cloudinary-public-id.js)
2. [`delete-multiple-media-contract.md`](./delete-multiple-media-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

