# NovaSocial Private Public ID Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the structural invariants of the extracted private Cloudinary public-ID parser.

## Contract

`_extractPublicId(url)` returns `null` for missing/non-string input, non-Cloudinary URLs, or URLs without `/upload/`. For valid URLs it removes a leading `v<digits>/` version segment, strips the final extension, and returns the remaining public-ID path. Parser errors return `null`.

The helper owns parsing only. It does not delete files, write records, call Supabase, access the DOM, or perform network requests.

## Harness coverage

`docs/private-public-id-contract-harness.js` validates input/provider guards, upload-path parsing, version removal, extension stripping, error fallback, and parser-only scope.

The harness is deterministic and static. It does not contact Cloudinary or invoke deletion behavior.

## Safe boundary

The extracted `src/features/private-public-id.js` module remains unchanged in this checkpoint. Cloudinary deletion and protected storage systems remain untouched.

## References

1. [`private-public-id.js`](../src/features/private-public-id.js)
2. [`extract-cloudinary-public-id-contract.md`](./extract-cloudinary-public-id-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

