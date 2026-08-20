# NovaSocial Post-Creation Flow Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the extracted create-entry and protected post/reel submission invariants before any further structural change.

## Contract

The extracted `showCreateMenu()` and `showCreate(type)` functions remain the entry boundary for Post, Reel, Story, and Live options. For Post and Reel, the modal preserves media selection, preview, caption, location, mention, AI, collaboration, scheduling controls, upload progress, and disabled-until-media-selected submit behavior. Story creation continues through its existing inline Story editor boundary.

`submitCreate(type)` validates the selected file and account state before uploading through the existing media boundary. It derives video metadata without blocking upload, builds the post payload with media type, reel flag, caption, location, and optional thumbnail, and attempts insertion with a co-author before retrying without the optional co-author column when appropriate. Rate-limit errors are propagated without an unsafe retry.

After a successful insert, the flow resets collaboration/filter state, sends best-effort co-author, mention, hashtag, and follower notifications, invalidates home/profile/explore caches, destroys the persistent Reels container for new reels, closes the modal, and navigates to the relevant destination. Failure feedback remains bounded and distinguishes rate limits, network problems, oversized files, and generic upload failures.

## Harness coverage

`docs/post-creation-flow-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Entry menu | Preserve Post/Reel/Story/Live actions | PASS |
| Create modal | Preserve media, caption, location, tools, progress, and submit controls | PASS |
| Upload boundary | Validate file/account and use existing media upload | PASS |
| Insert payload | Preserve media type, reel flag, caption, location, thumbnail, and optional co-author | PASS |
| Co-author fallback | Retry without optional co-author only for the existing compatibility path | PASS |
| Notifications | Keep co-author, mention, hashtag, and follower dispatch best effort | PASS |
| Cache/navigation | Invalidate relevant caches and route after success | PASS |
| Reel freshness | Destroy persistent Reels container after new reel creation | PASS |
| Failure feedback | Preserve rate-limit, network, size, and generic error messages | PASS |

The harness is deterministic and static. It does not upload media, insert posts, call AI, send notifications, mutate caches, or navigate the application.

## Safe boundary

No production post-creation code is moved or rewritten by this checkpoint. The extracted create-entry functions and inline `submitCreate()` implementation remain unchanged.

## Validation

The standalone harness must pass with all JavaScript syntax checks, every current contract harness, `/tmp/validate_*.py` validators, inline-script validation, whitespace checks, and explicit Branch2/main reference checks.

## References

1. [`create.js`](../src/features/create.js)
2. [`index.html`](../index.html)
3. [`share-story-post-contract.md`](./share-story-post-contract.md)
4. [`notification-dispatch-contract.md`](./notification-dispatch-contract.md)
5. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

