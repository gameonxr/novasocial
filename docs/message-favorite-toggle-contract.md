# NovaSocial Message Favorite Toggle Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the extracted message sticker favorite toggle helper.

## Contract

`toggleFavFromMsg(encUrl)` decodes the supplied encoded URL with `decodeURIComponent`, reads the `fav_stickers` local-storage array with an empty-array fallback, and toggles the decoded URL by membership.

When the URL is already present, it removes that entry and displays the removal toast. Otherwise, it prepends the URL and displays the addition toast. It persists the resulting array under `fav_stickers` and closes the active modal.

The helper owns local sticker-favorites UI/persistence only. Sticker search, message loading, network requests, and modal implementation remain outside this module. Existing JSON parsing behavior is documented rather than changed; the harness does not access local storage or user data.

## Harness coverage

`docs/message-favorite-toggle-contract-harness.js` validates decode behavior, storage key/fallback, membership branches, removal/addition toasts, newest-first insertion, persistence, modal closure, and non-ownership of network behavior.

## References

1. [`message-favorite-toggle.js`](../src/features/message-favorite-toggle.js)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

