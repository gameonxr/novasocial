# NovaSocial Copy Story Link Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the structural invariants of the extracted story-viewer clipboard helper.

## Contract

`copyStoryLink(id)` constructs a story URL from `window.location.origin + '/?story=' + id`, delegates it to `navigator.clipboard.writeText`, shows `Story link copied! 📋` on success, and closes the current modal. Clipboard failures show `Could not copy` without invoking success cleanup.

The helper owns link-copy feedback and modal cleanup only. Story loading, authorization, persistence, and viewer navigation remain outside this module.

## Harness coverage

`docs/copy-story-link-contract-harness.js` validates URL construction, clipboard delegation, success/error toast branches, and close-modal behavior.

The harness is deterministic and static. It does not access the clipboard, close modals, or mutate story state.

## Safe boundary

The extracted `src/features/copy-story-link.js` module remains unchanged in this checkpoint. Protected Stories systems remain untouched.

## References

1. [`copy-story-link.js`](../src/features/copy-story-link.js)
2. [`story-sticker-helpers-contract.md`](./story-sticker-helpers-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

