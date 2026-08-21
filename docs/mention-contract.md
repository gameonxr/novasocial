# NovaSocial Mention Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Purpose:** Lock the extracted caption-mention and scheduling helper behavior without changing production code or sending notifications.

## Contract

`checkMentionInCaption(textarea)` reads the cursor-local caption text, recognizes an Instagram-style `@` token, hides suggestions when no valid token exists, debounces the search by 300 milliseconds, queries `profiles` for up to five matching users excluding `ME.id`, and renders the suggestion list into `#mention-suggestions`.

`insertMentionIntoCaption(username, userId)` replaces the partial mention before the cursor with the selected username plus a trailing space, restores focus and cursor position, hides suggestions, and appends the selected user to `window._mentionedUsers`.

`sendMentionNotifications(postId)` is a no-op when no mentions are staged; otherwise it sends one existing `sendNotif` call per staged user and clears the staged list afterward. Notification delivery remains owned by the existing notification boundary.

`toggleScheduleMode(btn)` toggles `#schedule-input-wrap`, updates button styling, clears `_scheduleTime` when disabled, and when enabled sets `#schedule-time` to the minimum of now plus one hour.

This audit is static and documentation-only. It does not search users, mutate captions, send notifications, or change scheduled-post state.

## Harness coverage

`docs/mention-contract-harness.js` validates mention parsing/search markers, debounce timing, profile query constraints, insertion/cursor state, staged notification flushing, and schedule-mode transitions.

## References

1. [`mention.js`](../src/features/mention.js)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

