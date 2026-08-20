# NovaSocial Local Sticker Persistence Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the extracted local-sticker reader and recents persistence invariants before any further structural change.

## Contract

`getLocalStickers(type)` reads the `${type}_stickers` local-storage key, parses the stored JSON array, and returns an empty list after removing the malformed key when parsing fails. It remains tolerant of unavailable or invalid local data.

`saveLocalSticker(type, url)` reads the type-specific list, avoids inserting duplicate URLs, prepends new URLs, caps the list at 20 items by removing the oldest tail entry, and persists the resulting array under the same type-specific key. The helper does not own network calls, sticker rendering, message sending, or account state.

## Harness coverage

`docs/local-sticker-persistence-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Type isolation | Use `${type}_stickers` keys | PASS |
| Duplicate input | Avoid duplicate URL insertion | PASS |
| New input | Prepend URL as newest item | PASS |
| Capacity | Keep at most 20 entries | PASS |
| Malformed data | Remove invalid key and return empty list | PASS |
| Persistence | Save the updated list under the same key | PASS |
| Scope | Keep helper local-storage-only and separate from UI/network/message state | PASS |

The harness is deterministic and static. It does not access real local storage, render stickers, or send messages.

## Safe boundary

The extracted `src/features/get-local-stickers.js` and `src/features/save-local-sticker.js` modules remain unchanged in this checkpoint. No sticker, message, or DM production code moved or changed.

## Validation

The standalone harness must pass with all JavaScript syntax checks, every current contract harness, `/tmp/validate_*.py` validators, inline-script validation, whitespace checks, and explicit Branch2/main reference checks.

## References

1. [`get-local-stickers.js`](../src/features/get-local-stickers.js)
2. [`save-local-sticker.js`](../src/features/save-local-sticker.js)
3. [`sticker-favorites-contract.md`](./sticker-favorites-contract.md)
4. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

