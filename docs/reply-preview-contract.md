# NovaSocial Reply Preview Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the extracted chat reply-preview helper invariants before any further structural change.

## Contract

`replyMsg(id, text, name, mediaType, mediaUrl)` stores the reply target in `window.replyToId`, opens the existing `reply-preview` container when present, and derives a media fallback label for image, video, or audio replies when text is absent. It renders the author, preview content, and cancel action, updates the message-input focus, and shifts the visible scroll-down button above the preview bar by its measured height.

`cancelReply()` clears both reply state variables, hides the preview when present, and restores the scroll-down button to its baseline position. Missing optional DOM elements remain tolerated.

## Harness coverage

`docs/reply-preview-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Reply state | Store target ID and clear it on cancel | PASS |
| Media fallback | Preserve image, video, and audio labels | PASS |
| Preview surface | Render author, content, and cancel action | PASS |
| Focus | Focus the message input after rendering | PASS |
| Scroll offset | Raise visible scroll button by preview height | PASS |
| Cancel cleanup | Hide preview and restore baseline offset | PASS |
| Optional DOM | Tolerate missing preview or scroll elements | PASS |

The harness is deterministic and static. It does not open chats, access real DOM, send messages, or mutate reply state.

## Safe boundary

The extracted `src/features/reply-helpers.js` module remains unchanged in this checkpoint. Protected DM rendering, chat opening, sending, and navigation remain inline and untouched.

## Validation

The standalone harness must pass with all JavaScript syntax checks, every current contract harness, `/tmp/validate_*.py` validators, inline-script validation, whitespace checks, and explicit Branch2/main reference checks.

## References

1. [`reply-helpers.js`](../src/features/reply-helpers.js)
2. [`dm-seam-preparation-contract.md`](./dm-seam-preparation-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

