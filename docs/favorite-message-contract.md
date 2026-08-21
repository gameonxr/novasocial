# NovaSocial Favorite Message Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the extracted UI-only favorite-message helper.

## Contract

`favoriteMessage(mid)` displays the existing `Message Favorited ⭐` toast and closes the active modal through `closeModal()`.

The helper owns only the current UI feedback behavior. Message favorite persistence, server mutation, message rendering, and chat realtime remain outside this module. The existing unused `mid` parameter is documented rather than changed as part of this structural audit.

## Harness coverage

`docs/favorite-message-contract-harness.js` validates the function signature, toast feedback, modal close delegation, and non-ownership of persistence/network behavior.

The harness is static and deterministic. It does not favorite messages, open chats, or mutate account data.

## References

1. [`favorite-message.js`](../src/features/favorite-message.js)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

