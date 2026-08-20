# NovaSocial Sticker Favorites Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the extracted sticker-favorites toggle invariants before any further structural change.

## Contract

`toggleFavSticker(url, e, btn)` stops event propagation when an event is provided so a favorite action does not also trigger sticker sending. It reads the existing favorite sticker list, removes an already-favorited URL or prepends a new URL, updates the optional button with the matching star state, emits the matching toast, and persists the resulting list under `fav_stickers`.

The helper remains local and UI-focused. It delegates list parsing to `getLocalStickers('fav')` and does not own network calls, message sending, account state, or navigation.

## Harness coverage

`docs/sticker-favorites-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Event isolation | Stop propagation when an event exists | PASS |
| Remove favorite | Remove existing URL and show empty-star state | PASS |
| Add favorite | Prepend new URL and show filled-star state | PASS |
| Feedback | Emit matching add/remove toast | PASS |
| Persistence | Save final list under `fav_stickers` | PASS |
| Scope | Keep helper local/UI-only and separate from sending | PASS |

The harness is deterministic and static. It does not access real local storage, send stickers, or mutate messages.

## Safe boundary

The extracted `src/features/toggle-fav-sticker.js` module remains unchanged in this checkpoint. No sticker sending, message, or DM production code moved or changed.

## Validation

The standalone harness must pass with all JavaScript syntax checks, every current contract harness, `/tmp/validate_*.py` validators, inline-script validation, whitespace checks, and explicit Branch2/main reference checks.

## References

1. [`toggle-fav-sticker.js`](../src/features/toggle-fav-sticker.js)
2. [`sticker-toggle-contract.md`](./sticker-toggle-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

