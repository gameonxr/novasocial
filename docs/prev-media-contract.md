# NovaSocial Previous Media Preview Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the structural invariants of the extracted media-preview UI handler.

## Contract

`prevMedia(inp, type)` returns when no file is selected, creates an object URL for a selected file, resets video-trim and filter state, and resolves `#mprev`. Video files render an autoplaying muted inline preview, probe metadata, store full duration, show video-length options, reveal edit tools, and delegate to `showFilterTray(url)`.

Non-video files render an image preview, hide `#vlenpick` when present, reveal edit tools, and delegate to the same filter tray. Both branches enable `#cbtn` and set its opacity to `1`. Upload processing, trimming, filtering execution, and post submission remain outside this UI handler.

## Harness coverage

`docs/prev-media-contract-harness.js` validates file guards, object URL setup, state resets, video/image branch markers, metadata probing, filter/edit-tool delegation, video-length handling, and publish-button enablement.

The harness is deterministic and static. It does not create object URLs, access media, render DOM, or submit posts.

## Safe boundary

The extracted `src/features/prev-media.js` module remains unchanged in this checkpoint. Protected media upload, trimming, filters, and post-creation execution remain untouched.

## References

1. [`prev-media.js`](../src/features/prev-media.js)
2. [`post-creation-contract.md`](./post-creation-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

