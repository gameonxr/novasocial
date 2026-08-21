# NovaSocial Collaboration Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-21  
**Purpose:** Record the structural invariants of the collaborative-post co-author picker without creating or submitting a post.

## Contract

`showCollabPicker()` creates an Add Co-Author modal, renders a loading state, queries the current user’s followings with profile metadata, and handles an empty following list with the existing instructional state.

For results, it renders the Collaborative Post explanation, search input, scrollable collaborator list, avatar and username entries, and `selectCollab(id, username)` routing. It stores the loaded users in `window._collabUsers`. `filterCollabList(q)` performs case-insensitive username filtering, renders the matching list or No match state, and returns when the list or user cache is absent.

`selectCollab(uid, uname)` stores `window._collabAuthor`, emits the co-author toast, closes the modal, and updates `#cbtn` to Share with Co-Author when present. The helper does not create, persist, or submit a post.

The harness is static and documentation-only. It does not query followings, select a collaborator, or modify the create modal.

## Harness coverage

`docs/collaboration-contract-harness.js` validates modal/loading state, follows query, empty state, user cache, search filtering, No match state, selection state, toast/close behavior, create-button update, and side-effect boundaries.

## References

1. [`collaboration.js`](../src/features/collaboration.js)
2. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

