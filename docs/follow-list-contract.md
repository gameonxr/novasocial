# NovaSocial Follow List Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the extracted follower/following list and quick-follow helpers without executing account actions.

## Contract

`showFollowList(userId, type)` creates a Followers or Following modal, renders a loading state, inverts the follows foreign-key direction according to `type`, queries profiles through the existing `db` client, filters null profiles, and renders the empty state when no users are available.

Each result closes the modal and delegates to `showUserProfile(id)`, preserving avatar and username display. `quickFollowFromList(uid, btn)` derives the next state from the button text, optimistically updates text and class, inserts or deletes the follow row as appropriate, delegates a follow notification on insertion, and emits the existing error toast when persistence fails.

The harness is static and documentation-only. It does not open a follower modal, query follows, change follow state, send notifications, or open profiles.

## Harness coverage

`docs/follow-list-contract-harness.js` validates modal titles, loading/empty states, follower/following query inversion, profile rendering and navigation, optimistic button state, insert/delete branches, notification delegation, and error feedback.

## References

1. [`follow-list.js`](../src/features/follow-list.js)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

