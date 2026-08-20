# NovaSocial Object-URL Lifecycle Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Preserve the current browser object-URL creation and cleanup boundaries for downloads, compression, and media previews.

## Contract

The application surface currently contains 14 `URL.createObjectURL()` calls and eight `URL.revokeObjectURL()` calls. The cleanup-bearing operations are the Story download, post-media download, image compression, and video compression helpers. Their existing cleanup markers must remain intact.

Other creation sites are preview/editor-owned URLs used by Story, post, and media-preview UI. This contract records those creation sites without speculatively adding revocation, because changing their ownership or replacing their preview lifecycle would be a behavior change outside modularization. The audit does not claim that creation and revocation counts must match one-to-one.

## Harness coverage

`docs/object-url-lifecycle-contract-harness.js` scans `index.html` and `src/**/*.js`. It asserts the current total counts, confirms the four cleanup-bearing source surfaces, and confirms preview/editor creation markers remain present. It does not create blobs, access files, open media, download content, or call browser URL APIs.

| Check | Expected behavior | Result |
|---|---:|---|
| Object-URL creations | 14 existing calls | PASS |
| Object-URL revocations | 8 existing calls | PASS |
| Download cleanup | Story and post-media download revocation retained | PASS |
| Compression cleanup | Image and video error/finish revocation retained | PASS |
| Preview ownership | Existing preview creation sites preserved without speculative changes | PASS |

## Safe boundary

No production logic is changed by this audit. It records current object-URL ownership so future extraction cannot silently remove cleanup from ephemeral operations or alter preview lifecycles.

## References

1. [`index.html`](../index.html)
2. [`src/features/post-actions.js`](../src/features/post-actions.js)
3. [`src/features/compress-image.js`](../src/features/compress-image.js)
4. [`src/features/compress-video.js`](../src/features/compress-video.js)
5. [`src/features/prev-media.js`](../src/features/prev-media.js)
6. [`src/features/story-text-helpers.js`](../src/features/story-text-helpers.js)

